import test from 'node:test';
import assert from 'node:assert/strict';
import { Platform } from '../src/platform.mjs';

test('Lernantworten bleiben kontogebunden; Export und Löschung funktionieren', async () => {
  const p=new Platform(); const a=await p.register('admin@example.org','a-long-password-123',true);
  const b=await p.register('student@example.org','b-long-password-123');
  p.saveLearning(a.id,{kind:'skill',contentId:'SK-01',phase:0,answer:'Eine begründete Arbeitsprobe.'});
  assert.equal(p.learning(a.id).length,1); assert.equal(p.learning(b.id).length,0);
  assert.equal(p.exportPersonal(a.id).learning.length,1);
  p.deletePersonal(a.id); assert.equal(p.state.learning.length,0);
  assert.throws(()=>p.exportPersonal(a.id),/forbidden/);
});

test('Prompt, Grill-me und Workshop werden im Konto gespeichert und exportiert',async()=>{
  const p=new Platform();const user=await p.register('admin@example.org','a-long-password-123',true);
  for(const [kind,contentId] of [['prompt','PROMPT-01'],['grill','GRILL-01'],['workshop','WORKSHOP-01']])p.saveLearning(user.id,{kind,contentId,phase:0,answer:`Eigene Arbeitsprobe zu ${contentId}`});
  assert.deepEqual(p.learning(user.id).map(x=>x.kind),['prompt','grill','workshop']);
  assert.equal(p.exportPersonal(user.id).learning.length,3);
});

test('Campusrollen, Plätze, Einreichung und Lehrendenfeedback', async () => {
  const p=new Platform(); const admin=await p.register('admin@example.org','a-long-password-123',true);
  const teacher=await p.register('teacher@example.org','a-long-password-123');
  const student=await p.register('student@example.org','a-long-password-123');
  const request=p.requestCampus(teacher.id,'Testcampus');
  p.approveCampus(admin.id,request.id,2);
  p.addMemberByEmail(teacher.id,request.id,student.email,'student');
  assert.throws(()=>p.addMemberByEmail(teacher.id,request.id,admin.email,'student'),/seat_limit/);
  const course=p.createCourse(teacher.id,request.id,'Decision Intelligence');
  const task=p.createAssignment(teacher.id,request.id,course.id,'Reversal-Memo','human-first');
  assert.throws(()=>p.submit(teacher.id,request.id,task.id,'Nicht erlaubt'),/forbidden/);
  const sub=p.submit(student.id,request.id,task.id,'Meine Entscheidung mit Gegenhypothese.');
  assert.equal(p.listSubmissions(student.id,request.id,task.id).length,1);
  p.feedback(teacher.id,request.id,sub.id,'Gegenposition bitte präzisieren.','Entscheiden');
  assert.equal(p.passport(student.id).evidence.length,1);
});

test('Passwörter werden nicht im Klartext gespeichert und Sessions verfallen', async () => {
  const p=new Platform(); await p.register('admin@example.org','a-long-password-123',true);
  assert.ok(!JSON.stringify(p.exportState()).includes('a-long-password-123'));
  const login=await p.login('admin@example.org','a-long-password-123');
  assert.ok(p.session(login.token)); p.logout(login.token); assert.equal(p.session(login.token),null);
  await assert.rejects(()=>p.login('admin@example.org','wrong-password'),/invalid_credentials/);
});
