import { createServer } from 'node:http';
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Platform } from './platform.mjs';
import { catalog } from './content.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const stateFile = resolve(process.env.ACADEMY_DATA_FILE || './data/academy-state.json');
const port = Number(process.env.PORT || 3000);
const setupKey = process.env.ACADEMY_SETUP_KEY || '';
let state = {};
try { state = JSON.parse(await readFile(stateFile, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const platform = new Platform(state);
let queue = Promise.resolve();
const persist = () => {
  queue = queue.then(async () => {
    await mkdir(dirname(stateFile), { recursive: true });
    const temp = `${stateFile}.tmp`;
    await writeFile(temp, JSON.stringify(platform.exportState(), null, 2));
    await rename(temp, stateFile);
  });
  return queue;
};
const reply = (res, status, body, type = 'application/json; charset=utf-8') => {
  res.writeHead(status, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    'Cache-Control': type.startsWith('text/html') ? 'no-store' : 'no-cache' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};
const readBody = async req => {
  let raw = '';
  for await (const chunk of req) { raw += chunk; if (raw.length > 100000) throw Error('body_too_large'); }
  try { return raw ? JSON.parse(raw) : {}; } catch { throw Error('invalid_json'); }
};
const cookie = req => Object.fromEntries((req.headers.cookie || '').split(';').map(x => x.trim().split('=')).filter(x => x.length === 2));
const auth = req => { const token = cookie(req).academy_session; const session = platform.session(token); if (!session) throw Error('unauthorized');
  if (req.method !== 'GET' && req.headers['x-csrf-token'] !== session.csrf) throw Error('csrf_required'); return { token, actor: session.userId, csrf: session.csrf }; };
const action = async (req, res, path) => {
  if (req.method === 'GET' && path === '/api/content') return reply(res, 200, catalog);
  if (req.method === 'GET' && path === '/api/status') return reply(res, 200, { setupRequired: platform.state.users.length === 0, accountAvailable: platform.state.users.length > 0 });
  if (req.method === 'POST' && path === '/api/setup') {
    if (!setupKey || req.headers['x-setup-key'] !== setupKey) throw Error('forbidden');
    const body = await readBody(req); const user = await platform.register(body.email, body.password, true); await persist(); return reply(res, 201, user);
  }
  if (req.method === 'POST' && path === '/api/register') { const body = await readBody(req); const user = await platform.register(body.email, body.password); await persist(); return reply(res, 201, user); }
  if (req.method === 'POST' && path === '/api/login') { const body = await readBody(req); const result = await platform.login(body.email, body.password);
    res.setHeader('Set-Cookie', `academy_session=${result.token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${process.env.ACADEMY_SECURE_COOKIE === '1' ? '; Secure' : ''}`);
    return reply(res, 200, { user: result.user, csrf: result.csrf }); }
  const { actor, token } = auth(req);
  if (req.method === 'GET' && path === '/api/me') return reply(res, 200, { user: platform.publicUser(actor), csrf: platform.session(token).csrf, campuses: platform.campuses(actor) });
  if (req.method === 'POST' && path === '/api/logout') { platform.logout(token); res.setHeader('Set-Cookie', 'academy_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'); return reply(res, 200, { ok: true }); }
  if (req.method === 'GET' && path === '/api/learning') return reply(res, 200, platform.learning(actor));
  if (req.method === 'POST' && path === '/api/learning') { const body = await readBody(req);
    const collection = {skill:catalog.skills,case:catalog.cases,game:catalog.gameQuestions,assessment:catalog.assessment,crisis:catalog.crises,path:catalog.worlds}[body.kind];
    if (!collection?.some(x=>x.id===body.contentId)) throw Error('invalid_content_id');
    const item = platform.saveLearning(actor, body); await persist(); return reply(res, 201, item); }
  if (req.method === 'GET' && path === '/api/export') return reply(res, 200, platform.exportPersonal(actor));
  if (req.method === 'POST' && path === '/api/delete-account') { const body = await readBody(req); if (body.confirm !== 'LÖSCHEN') throw Error('confirmation_required');
    const result = platform.deletePersonal(actor); await persist(); res.setHeader('Set-Cookie', 'academy_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'); return reply(res, 200, result); }
  if (req.method === 'GET' && path === '/api/campuses') return reply(res, 200, platform.campuses(actor));
  if (req.method === 'POST' && path === '/api/campuses/request') { const body = await readBody(req); const item = platform.requestCampus(actor, body.name); await persist(); return reply(res, 201, item); }
  if (req.method === 'GET' && path === '/api/campuses/requests') return reply(res, 200, platform.requests(actor));
  if (req.method === 'POST' && path === '/api/campuses/approve') { const body = await readBody(req); const item = platform.approveCampus(actor, body.campusId, body.seats); await persist(); return reply(res, 200, item); }
  if (req.method === 'POST' && path === '/api/campuses/member') { const body = await readBody(req); const item = platform.addMemberByEmail(actor, body.campusId, body.email, body.role); await persist(); return reply(res, 201, item); }
  if (req.method === 'GET' && path === '/api/courses') return reply(res, 200, platform.listCourses(actor, new URL(req.url, 'http://localhost').searchParams.get('campusId')));
  if (req.method === 'POST' && path === '/api/courses') { const b = await readBody(req); const item = platform.createCourse(actor, b.campusId, b.title); await persist(); return reply(res, 201, item); }
  if (req.method === 'POST' && path === '/api/assignments') { const b = await readBody(req); const item = platform.createAssignment(actor, b.campusId, b.courseId, b.title, b.mode, b.dueAt || null); await persist(); return reply(res, 201, item); }
  if (req.method === 'POST' && path === '/api/submissions') { const b = await readBody(req); const item = platform.submit(actor, b.campusId, b.assignmentId, b.text); await persist(); return reply(res, 201, item); }
  if (req.method === 'GET' && path === '/api/submissions') { const p = new URL(req.url, 'http://localhost').searchParams; return reply(res, 200, platform.listSubmissions(actor, p.get('campusId'), p.get('assignmentId'))); }
  if (req.method === 'POST' && path === '/api/feedback') { const b = await readBody(req); const item = platform.feedback(actor, b.campusId, b.submissionId, b.text, b.skill); await persist(); return reply(res, 200, item); }
  throw Error('not_found');
};
const files = { '/': ['index.html', 'text/html; charset=utf-8'], '/app.css': ['../app.css', 'text/css; charset=utf-8'], '/app.js': ['../app.js', 'text/javascript; charset=utf-8'], '/theme.js': ['../theme.js', 'text/javascript; charset=utf-8'] };
const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname;
    if (path.startsWith('/api/')) return await action(req, res, path);
    if (req.method === 'GET' && (/^\/assets\/nav\/[a-z-]+\.svg$/.test(path) || /^\/assets\/worlds\/[a-z-]+\.png$/.test(path) || path === '/assets/hero-future.png' || path === '/assets/classic-staircase.png'))
      return reply(res, 200, await readFile(resolve(root, '..', path.slice(1))), path.endsWith('.png') ? 'image/png' : 'image/svg+xml');
    const asset = files[path]; if (!asset || req.method !== 'GET') throw Error('not_found');
    return reply(res, 200, await readFile(resolve(root, asset[0]), 'utf8'), asset[1]);
  } catch (error) { const status = error.message === 'not_found' ? 404 : ['unauthorized', 'csrf_required'].includes(error.message) ? 401 :
      ['forbidden', 'setup_required'].includes(error.message) ? 403 : 400; reply(res, status, { error: error.message }); }
});
if (process.env.NODE_ENV !== 'test') server.listen(port, '127.0.0.1', () => console.log(`Academy: http://127.0.0.1:${port}`));
export { server, platform };
