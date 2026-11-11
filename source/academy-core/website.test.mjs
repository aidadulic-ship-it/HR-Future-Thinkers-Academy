import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createAcademyServer } from './server.mjs';

function dispatch(server, path, body) {
  const hasBody = body !== undefined;
  const request = Readable.from(hasBody ? [JSON.stringify(body)] : []);
  request.url = path;
  request.method = hasBody ? 'POST' : 'GET';
  request.headers = hasBody ? { 'content-type': 'application/json' } : {};
  return new Promise(resolve => {
    const response = {
      setHeader() {},
      writeHead(status, headers) {
        this.status = status;
        this.headers = headers;
      },
      end(data) {
        resolve({ status: this.status, headers: this.headers, data });
      },
    };
    server.emit('request', request, response);
  });
}

test('öffentliche Academy und Campus-Freigabe über den HTTP-Handler', async () => {
  const server = createAcademyServer();
  const redirect = await dispatch(server, '/academy');
  assert.equal(redirect.status, 308);
  const page = await dispatch(server, redirect.headers.Location);
  assert.equal(page.status, 200);
  assert.match(page.data.toString(), /HR Future/);
  assert.equal((await dispatch(server, '/academy/site.css')).status, 200);
  assert.equal((await dispatch(server, '/academy/site.js')).status, 200);
  assert.equal((await dispatch(server, '/academy/hero.png')).status, 200);
  const request = (path, body) => dispatch(server, '/academy/demo/' + path, body);
  const application = await request('request', { name: 'Hochschule Wien' });
  assert.equal(application.status, 201);
  const { id } = JSON.parse(application.data);
  assert.equal((await request('view', { id })).status, 403);
  assert.equal((await request('approve', { id, seats: 0 })).status, 400);
  assert.equal((await request('approve', { id, seats: 20 })).status, 200);
  const campus = await request('view', { id });
  assert.deepEqual(JSON.parse(campus.data), { id, name: 'Hochschule Wien', role: 'campus-admin' });
});

