import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const roles = new Set(['teacher', 'student']);
const modes = new Set(['human-first', 'human-ai', 'human-only']);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const fail = code => { throw new Error(code); };
const requireValue = (condition, code) => { if (!condition) fail(code); };
const clean = (value, max = 4000) => {
  requireValue(nonempty(value) && value.length <= max, 'invalid_input');
  return value.trim();
};
const id = () => randomUUID();
const now = () => new Date().toISOString();

export class Platform {
  constructor(state = {}) {
    this.state = {
      users: state.users ?? [], campuses: state.campuses ?? [], courses: state.courses ?? [],
      assignments: state.assignments ?? [], submissions: state.submissions ?? [],
      evidence: state.evidence ?? [], traces: state.traces ?? [], reflections: state.reflections ?? [],
      improvements: state.improvements ?? [], innovations: state.innovations ?? [],
      learning: state.learning ?? [],
    };
    this.sessions = new Map();
  }

  exportState() { return structuredClone(this.state); }
  publicUser(userId) {
    const user = this.user(userId);
    return { id: user.id, email: user.email, role: user.role };
  }
  user(userId) {
    const user = this.state.users.find(item => item.id === userId);
    requireValue(user, 'forbidden');
    return user;
  }
  async register(email, password, platformAdmin = false) {
    requireValue(typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254, 'invalid_email');
    requireValue(typeof password === 'string' && password.length >= 12 && password.length <= 1024, 'invalid_password');
    requireValue(platformAdmin || this.state.users.length > 0, 'setup_required');
    requireValue(!platformAdmin || this.state.users.length === 0, 'forbidden');
    const normalized = email.trim().toLowerCase();
    requireValue(!this.state.users.some(item => item.email === normalized), 'email_exists');
    const salt = randomBytes(16).toString('hex');
    const hash = (await scrypt(password, salt, 64)).toString('hex');
    const user = { id: id(), email: normalized, role: platformAdmin ? 'platform-admin' : 'member', salt, hash, createdAt: now() };
    this.state.users.push(user);
    return this.publicUser(user.id);
  }
  async login(email, password) {
    const user = this.state.users.find(item => item.email === String(email).trim().toLowerCase());
    const salt = user?.salt ?? '00000000000000000000000000000000';
    const candidate = await scrypt(String(password), salt, 64);
    const expected = Buffer.from(user?.hash ?? '00'.repeat(64), 'hex');
    requireValue(user && timingSafeEqual(candidate, expected), 'invalid_credentials');
    for (const [token, session] of this.sessions) if (session.userId === user.id) this.sessions.delete(token);
    const token = randomBytes(32).toString('base64url');
    const csrf = randomBytes(24).toString('base64url');
    this.sessions.set(token, { userId: user.id, csrf, expiresAt: Date.now() + 12 * 60 * 60 * 1000 });
    return { token, csrf, user: this.publicUser(user.id) };
  }
  session(token) {
    const session = this.sessions.get(token);
    if (!session) return null;
    if (session.expiresAt <= Date.now()) { this.sessions.delete(token); return null; }
    return session;
  }
  logout(token) { this.sessions.delete(token); }

  saveLearning(actor, input) {
    this.user(actor);
    requireValue(['skill', 'case', 'game', 'assessment', 'crisis', 'path', 'prompt', 'grill', 'workshop'].includes(input.kind), 'invalid_kind');
    const entry = { id: id(), userId: actor, kind: input.kind, contentId: clean(input.contentId, 80),
      phase: Number.isSafeInteger(input.phase) && input.phase >= 0 && input.phase <= 24 ? input.phase : 0,
      level: input.level === 'executive' ? 'executive' : 'foundation',
      answer: clean(input.answer, 20000), createdAt: now() };
    this.state.learning.push(entry);
    return entry;
  }
  learning(actor) { this.user(actor); return this.state.learning.filter(x => x.userId === actor); }
  exportPersonal(actor) {
    const user = this.publicUser(actor);
    return { user, learning: this.learning(actor), evidence: this.evidence(actor), traces: this.traces(actor),
      passport: this.passport(actor), innovations: this.innovation(actor),
      submissions: this.state.submissions.filter(x => x.studentId === actor) };
  }
  deletePersonal(actor) {
    this.user(actor);
    requireValue(!this.state.campuses.some(c => c.status === 'active' && c.members.some(m => m.userId === actor && m.role === 'campus-admin') &&
      c.members.filter(m => m.role === 'campus-admin').length === 1), 'transfer_campus_first');
    this.state.campuses = this.state.campuses.filter(c => !(c.status === 'pending' && c.applicant === actor));
    for (const campus of this.state.campuses) campus.members = campus.members.filter(m => m.userId !== actor);
    for (const key of ['learning', 'evidence', 'traces', 'reflections']) this.state[key] = this.state[key].filter(x => x.userId !== actor);
    this.state.innovations = this.state.innovations.filter(x => x.authorId !== actor);
    this.state.submissions = this.state.submissions.filter(x => x.studentId !== actor);
    for (const [token, session] of this.sessions) if (session.userId === actor) this.sessions.delete(token);
    this.state.users = this.state.users.filter(x => x.id !== actor);
    return { deleted: true };
  }

  requestCampus(actor, name) {
    this.user(actor);
    const campus = { id: id(), name: clean(name, 120), applicant: actor, status: 'pending', seats: 0, members: [], createdAt: now() };
    this.state.campuses.push(campus);
    return { id: campus.id, name: campus.name, status: campus.status };
  }
  requests(actor) {
    requireValue(this.user(actor).role === 'platform-admin', 'forbidden');
    return this.state.campuses.filter(c => c.status === 'pending').map(c => ({ id: c.id, name: c.name, applicant: this.publicUser(c.applicant).email }));
  }
  approveCampus(actor, campusId, seats) {
    requireValue(this.user(actor).role === 'platform-admin', 'forbidden');
    const campus = this.state.campuses.find(c => c.id === campusId);
    requireValue(campus?.status === 'pending', 'invalid_state');
    requireValue(Number.isSafeInteger(seats) && seats > 0 && seats <= 100000, 'invalid_seat_limit');
    campus.seats = seats;
    campus.status = 'active';
    campus.members.push({ userId: campus.applicant, role: 'campus-admin' });
    return this.campus(campus.applicant, campus.id);
  }
  campus(actor, campusId) {
    const campus = this.state.campuses.find(c => c.id === campusId && c.status === 'active');
    const membership = campus?.members.find(m => m.userId === actor);
    requireValue(membership, 'forbidden');
    return { id: campus.id, name: campus.name, role: membership.role, seats: campus.seats, members: campus.members.length };
  }
  campuses(actor) { this.user(actor); return this.state.campuses.filter(c => c.status === 'active' && c.members.some(m => m.userId === actor)).map(c => this.campus(actor, c.id)); }
  role(actor, campusId, allowed) {
    const campus = this.campus(actor, campusId);
    requireValue(allowed.includes(campus.role), 'forbidden');
    return campus;
  }
  addMember(actor, campusId, accountId, role) {
    const campus = this.state.campuses.find(c => c.id === campusId);
    this.role(actor, campusId, ['campus-admin']);
    this.user(accountId);
    requireValue(roles.has(role), 'invalid_role');
    requireValue(!campus.members.some(m => m.userId === accountId), 'already_member');
    requireValue(campus.members.length < campus.seats, 'seat_limit');
    campus.members.push({ userId: accountId, role });
    return this.campus(accountId, campusId);
  }
  addMemberByEmail(actor, campusId, email, role) {
    const account = this.state.users.find(u => u.email === String(email).trim().toLowerCase());
    requireValue(account, 'unknown_account');
    return this.addMember(actor, campusId, account.id, role);
  }
  members(actor, campusId) {
    this.role(actor, campusId, ['campus-admin', 'teacher']);
    const campus = this.state.campuses.find(c => c.id === campusId);
    return campus.members.map(m => ({ ...this.publicUser(m.userId), campusRole: m.role }));
  }
  removeMember(actor, campusId, accountId) {
    this.role(actor, campusId, ['campus-admin']);
    const campus = this.state.campuses.find(c => c.id === campusId);
    requireValue(accountId !== campus.applicant && campus.members.some(m => m.userId === accountId), 'invalid_member');
    campus.members = campus.members.filter(m => m.userId !== accountId);
  }

  createCourse(actor, campusId, title) {
    this.role(actor, campusId, ['campus-admin', 'teacher']);
    const course = { id: id(), campusId, title: clean(title, 160), teacherId: actor, createdAt: now() };
    this.state.courses.push(course);
    return course;
  }
  listCourses(actor, campusId) {
    this.campus(actor, campusId);
    return this.state.courses.filter(c => c.campusId === campusId).map(c => ({ ...c, assignments: this.state.assignments.filter(a => a.courseId === c.id) }));
  }
  createAssignment(actor, campusId, courseId, title, mode, dueAt = null) {
    this.role(actor, campusId, ['campus-admin', 'teacher']);
    requireValue(this.state.courses.some(c => c.id === courseId && c.campusId === campusId), 'invalid_course');
    requireValue(modes.has(mode), 'invalid_mode');
    requireValue(dueAt === null || !Number.isNaN(Date.parse(dueAt)), 'invalid_date');
    const assignment = { id: id(), campusId, courseId, title: clean(title, 160), mode, dueAt, createdAt: now() };
    this.state.assignments.push(assignment);
    return assignment;
  }
  submit(actor, campusId, assignmentId, text) {
    this.role(actor, campusId, ['student']);
    const assignment = this.state.assignments.find(a => a.id === assignmentId && a.campusId === campusId);
    requireValue(assignment, 'invalid_assignment');
    requireValue(!assignment.dueAt || Date.parse(assignment.dueAt) >= Date.now(), 'deadline_passed');
    const existing = this.state.submissions.find(s => s.assignmentId === assignmentId && s.studentId === actor);
    requireValue(!existing, 'already_submitted');
    const submission = { id: id(), campusId, assignmentId, studentId: actor, text: clean(text, 20000), submittedAt: now(), feedback: null };
    this.state.submissions.push(submission);
    return submission;
  }
  listSubmissions(actor, campusId, assignmentId) {
    const campus = this.campus(actor, campusId);
    requireValue(this.state.assignments.some(a => a.id === assignmentId && a.campusId === campusId), 'invalid_assignment');
    return this.state.submissions.filter(s => s.assignmentId === assignmentId && (campus.role !== 'student' || s.studentId === actor)).map(s => ({ ...s, studentEmail: this.publicUser(s.studentId).email }));
  }
  feedback(actor, campusId, submissionId, text, skill) {
    this.role(actor, campusId, ['campus-admin', 'teacher']);
    const submission = this.state.submissions.find(s => s.id === submissionId && s.campusId === campusId);
    requireValue(submission, 'invalid_submission');
    submission.feedback = { text: clean(text, 5000), skill: clean(skill, 100), teacherId: actor, createdAt: now() };
    return submission;
  }

  addEvidence(actor, input) {
    this.user(actor);
    let source;
    try { source = new URL(input.source); } catch { fail('invalid_source'); }
    requireValue(['https:', 'http:'].includes(source.protocol), 'invalid_source');
    requireValue(Number.isSafeInteger(input.year) && input.year >= 1900 && input.year <= new Date().getFullYear() + 1, 'invalid_year');
    const entry = { id: id(), userId: actor, claim: clean(input.claim), source: source.href, year: input.year, limitations: clean(input.limitations ?? 'Noch nicht geprüft'), status: 'unverified', createdAt: now() };
    this.state.evidence.push(entry);
    return entry;
  }
  evidence(actor) { this.user(actor); return this.state.evidence.filter(e => e.userId === actor); }
  addTrace(actor, input) {
    this.user(actor);
    requireValue(input.confirmed === true, 'confirmation_required');
    const entry = { id: id(), userId: actor, question: clean(input.question), aiSuggestion: nonempty(input.aiSuggestion) ? clean(input.aiSuggestion) : '', humanDecision: clean(input.humanDecision), rationale: clean(input.rationale ?? 'Begründung ausstehend'), reviewDate: input.reviewDate ?? null, confirmed: true, createdAt: now() };
    this.state.traces.push(entry);
    return entry;
  }
  traces(actor) { this.user(actor); return this.state.traces.filter(t => t.userId === actor); }
  addReflection(actor, skill, text) {
    this.user(actor);
    const entry = { id: id(), userId: actor, skill: clean(skill, 100), text: clean(text), createdAt: now() };
    this.state.reflections.push(entry);
    return entry;
  }
  passport(actor) {
    this.user(actor);
    return { reflections: this.state.reflections.filter(r => r.userId === actor), evidence: this.state.submissions.filter(s => s.studentId === actor && s.feedback).map(s => ({ submissionId: s.id, assignmentId: s.assignmentId, skill: s.feedback.skill, feedback: s.feedback.text, issuedAt: s.feedback.createdAt })) };
  }
  addImprovement(actor, campusId, input) {
    this.role(actor, campusId, ['campus-admin', 'teacher']);
    const entry = { id: id(), campusId, teacherId: actor, observation: clean(input.observation), change: clean(input.change), measure: clean(input.measure), createdAt: now() };
    this.state.improvements.push(entry);
    return entry;
  }
  improvements(actor, campusId) { this.role(actor, campusId, ['campus-admin', 'teacher']); return this.state.improvements.filter(i => i.campusId === campusId); }
  addInnovation(actor, title, hypothesis) {
    this.user(actor);
    const entry = { id: id(), authorId: actor, title: clean(title, 160), hypothesis: clean(hypothesis), status: 'private', createdAt: now() };
    this.state.innovations.push(entry);
    return entry;
  }
  innovation(actor) { this.user(actor); return this.state.innovations.filter(i => i.authorId === actor); }
}
