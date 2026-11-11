import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { Academy } from './academy.mjs';

const assets = new Map([
  ['/academy/', ['index.html', 'text/html; charset=utf-8']],
  ['/academy/site.css', ['site.css', 'text/css; charset=utf-8']],
  ['/academy/academy-browser.js', ['academy-browser.js', 'text/javascript; charset=utf-8']],
  ['/academy/site.js', ['site.js', 'text/javascript; charset=utf-8']],
  ['/academy/hero.png', ['hero.png', 'image/png']],
]);

function json(response, status, value) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(value));
}

export function createAcademyServer() {
  const academy = new Academy();
  academy.addAccount('demo-applicant');
  academy.addAccount('demo-admin', 'platform-admin');
  const actions = new Map([
    ['/academy/demo/request', ({ name }) => [201, { id: academy.requestCampus('demo-applicant', name) }]],
    ['/academy/demo/approve', ({ id, seats }) => {
      academy.approveCampus('demo-admin', id, seats);
      return [200, { approved: true }];
    }],
    ['/academy/demo/view', ({ id }) => [200, academy.viewCampus('demo-applicant', id)]],
  ]);

  return createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    const path = request.url.split('?')[0];
    if (request.method === 'GET' && path === '/academy') {
      response.writeHead(308, { Location: '/academy/' });
      response.end();
      return;
    }
    try {
      const asset = request.method === 'GET' && assets.get(path);
      if (asset) {
        const [filename, contentType] = asset;
        const data = await readFile(new URL(filename, import.meta.url));
        response.writeHead(200, { 'Content-Type': contentType });
        response.end(data);
        return;
      }
      const action = request.method === 'POST' && actions.get(path);
      if (!action) return json(response, 404, { error: 'not_found' });
      if (request.headers['content-type'] !== 'application/json') {
        return json(response, 415, { error: 'unsupported_media_type' });
      }
      let body = '';
      for await (const chunk of request) {
        body += chunk;
        if (body.length > 4096) return json(response, 413, { error: 'body_too_large' });
      }
      const data = JSON.parse(body);
      if (!data || Array.isArray(data) || typeof data !== 'object') {
        return json(response, 400, { error: 'invalid_body' });
      }
      json(response, ...action(data));
    } catch (error) {
      if (error.code === 'ENOENT') return json(response, 404, { error: 'not_found' });
      const status = { forbidden: 403, invalid_state: 409, invalid_name: 400, invalid_seat_limit: 400 }[error.message];
      if (status) return json(response, status, { error: error.message });
      if (error instanceof SyntaxError) return json(response, 400, { error: 'invalid_json' });
      json(response, 500, { error: 'internal_error' });
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createAcademyServer();
  server.listen(4173, '127.0.0.1', () => console.log('http://127.0.0.1:4173/academy'));
}



