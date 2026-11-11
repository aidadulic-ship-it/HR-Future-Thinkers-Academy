import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
function logic() {
  const context = { window: { addEventListener() {}, matchMedia: () => ({ matches: true }) }, document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} }, requestAnimationFrame() {}, setInterval() {}, clearInterval() {}, location: { hash: '' } };
  runInNewContext(html.match(/<script data-part="spiel">([\s\S]*?)<\/script>/)[1], context);
  return context;
}
const PLAIN_BANNED = /Keep Human|Augment|Automate|Pilot|Median|Indikator|Transfer|XP/;
const SKILLS = ['human-ai-work-design', 'safe-ai-hr', 'grill-me', 'hr-experiment', 'hr-data-reasoning', 'organization-diagnosis', 'hr-decision-lab', 'executive-hr-brief', 'learning-review', 'learning-design'];

test('jedes Level hat mindestens zwölf verständliche Fragen mit Erklärung und Tipp', () => {
  const { LEVELS } = logic();
  const seen = new Set();
  for (const level of LEVELS) {
    assert.ok(level.questions.length >= 12, level.title + ': ' + level.questions.length);
    for (const q of level.questions) {
      assert.ok(!seen.has(q.text), 'doppelt: ' + q.text);
      seen.add(q.text);
      assert.equal(new Set(q.options).size, 4, q.text);
      assert.ok(q.explain.length > 25 && q.hint.length >= 25, q.text);
      assert.doesNotMatch(q.text + q.options.join(' '), PLAIN_BANNED, q.text);
      if (q.skill) assert.ok(SKILLS.includes(q.skill), q.skill);
    }
  }
});

test('die richtige Antwort verrät sich nicht durch ihre Länge', () => {
  const { LEVELS } = logic();
  let textQuestions = 0;
  let uniqueLongest = 0;
  for (const level of LEVELS) for (const q of level.questions) {
    const lengths = q.options.map(option => option.length);
    if (Math.min(...lengths) < 16) continue;
    textQuestions += 1;
    assert.ok(Math.max(...lengths) / Math.min(...lengths) <= 1.8, q.text + ' ' + lengths);
    const longest = Math.max(...lengths);
    if (lengths[q.correct] === longest && lengths.filter(value => value === longest).length === 1) uniqueLongest += 1;
  }
  assert.ok(textQuestions >= 35, 'Textfragen: ' + textQuestions);
  assert.ok(uniqueLongest / textQuestions <= 0.25, 'richtige Antwort ist in ' + uniqueLongest + ' von ' + textQuestions + ' Fragen die längste');
});

test('Profi-Stufe: ohne Joker, höheres Levelziel, Sicherheit zählt, Schlussrunde fehlerfrei', () => {
  const { scoreAnswer, createLevelRun, answerQuestion, finalPassed, createFinalRound, LEVELS, PRO } = logic();
  assert.equal(createLevelRun(12, Math.random, true).jokers, 0);
  assert.equal(createLevelRun(12, Math.random, false).jokers, 2);
  assert.ok(createLevelRun(12, Math.random, true).target > createLevelRun(12, Math.random, false).target);
  const base = scoreAnswer({ correct: true, streak: 0, seconds: 99 });
  assert.equal(scoreAnswer({ correct: true, streak: 0, seconds: 99, pro: true, sure: true }), base + 50);
  assert.equal(scoreAnswer({ correct: true, streak: 0, seconds: 99, pro: true, sure: false }), base);
  assert.equal(scoreAnswer({ correct: false, streak: 0, seconds: 99, pro: true, sure: true }), -50);
  assert.equal(scoreAnswer({ correct: false, streak: 0, seconds: 99, pro: true, sure: false }), 0);
  const run = createLevelRun(12, Math.random, true);
  answerQuestion(run, { correct: false, seconds: 99, pro: true, sure: true });
  assert.equal(run.xp, 0, 'Punkte fallen nicht unter null');
  assert.equal(finalPassed({ correct: 4, total: 5, pro: true }), false);
  assert.equal(finalPassed({ correct: 5, total: 5, pro: true }), true);
  assert.equal(finalPassed({ correct: 4, total: 5 }), true);
  assert.equal(createFinalRound(LEVELS, Math.random, true).jokers, 0);
  assert.ok(PRO.seconds < 20);
});

test('Profi-Stufe ist am Start erklärt und fragt vor jeder Antwort nach der Sicherheit', () => {
  const start = html.split('id="screen-start"')[1].split('</section>')[0];
  assert.match(start, /<input type="checkbox" id="pro-mode">/);
  assert.match(start, /Profi-Stufe/);
  assert.match(start, /ohne Joker/i);
  const question = html.split('id="screen-question"')[1].split('</section>')[0];
  assert.match(question, /id="confidence"[^>]*hidden/);
  assert.match(question, /data-sure="true"[^>]*>Ich bin sicher/);
  assert.match(question, /data-sure="false"[^>]*>Ich bin unsicher/);
  assert.match(html, /id="final-calibration"/);
});

test('verzweigte Krisen: eine schwache Entscheidung verschärft die nächste Phase', () => {
  const { CRISES, createCrisisRun, chooseCrisisOption, crisisSituation } = logic();
  for (const crisis of CRISES) {
    assert.ok(!crisis.phases[0].strained, crisis.title);
    for (const phase of crisis.phases.slice(1)) {
      assert.ok(phase.strained && phase.strained.length > 80 && phase.strained !== phase.situation, crisis.title + ': ' + phase.question);
    }
  }
  const crisis = CRISES[0];
  const run = createCrisisRun();
  chooseCrisisOption(run, { quality: 'bad' });
  assert.equal(run.strained, true);
  assert.equal(crisisSituation(crisis, run), crisis.phases[1].strained);
  const trust = run.trust;
  chooseCrisisOption(run, { quality: 'best' });
  assert.equal(run.trust - trust, 10, 'unter Druck bringt die beste Wahl weniger');
  assert.equal(run.strained, false);
  assert.equal(crisisSituation(crisis, run), crisis.phases[2].situation);
  const calm = createCrisisRun();
  chooseCrisisOption(calm, { quality: 'best' });
  assert.equal(calm.trust, 65);
  assert.deepEqual([...calm.path], ['ruhig']);
  assert.match(html, /id="crisis-alert"[^>]*hidden/);
});
