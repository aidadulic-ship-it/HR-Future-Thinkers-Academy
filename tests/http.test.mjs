import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('HTTP-Handler: Setup, Auth, CSRF, Lernantwort, Persistenz und Datenschutz', async t => {
  const dir=await mkdtemp(join(tmpdir(),'academy-test-'));
  t.after(()=>rm(dir,{recursive:true,force:true}));
  process.env.NODE_ENV='test';process.env.ACADEMY_DATA_FILE=join(dir,'state.json');process.env.ACADEMY_SETUP_KEY='test-setup-key';
  const {server}=await import('../src/server.mjs');
  t.after(()=>server.close());
  const call=(url,method='GET',body,headers={})=>new Promise((resolve,reject)=>{
    const req=Readable.from(body?[JSON.stringify(body)]:[]);req.method=method;req.url=url;req.headers=headers;
    const res={status:200,headers:{},setHeader(k,v){this.headers[k.toLowerCase()]=v},writeHead(s,h){this.status=s;for(const [k,v] of Object.entries(h))this.setHeader(k,v)},end(text){try{resolve({status:this.status,headers:this.headers,body:JSON.parse(text)})}catch(e){reject(e)}}};
    server.emit('request',req,res);
  });
  let r=await call('/api/status');assert.equal(r.body.setupRequired,true);
  const artwork=await new Promise(resolve=>{const req=Readable.from([]);req.method='GET';req.url='/assets/worlds/horizon.png';req.headers={};const res={writeHead(status,headers){this.status=status;this.headers=headers},end(body){resolve({status:this.status,headers:this.headers,body})}};server.emit('request',req,res)});
  assert.equal(artwork.status,200);assert.equal(artwork.headers['Content-Type'],'image/png');assert.equal(artwork.body.subarray(1,4).toString(),'PNG');
  const classicArtwork=await new Promise(resolve=>{const req=Readable.from([]);req.method='GET';req.url='/assets/classic-staircase.png';req.headers={};const res={writeHead(status,headers){this.status=status;this.headers=headers},end(body){resolve({status:this.status,headers:this.headers,body})}};server.emit('request',req,res)});
  assert.equal(classicArtwork.status,200);assert.equal(classicArtwork.headers['Content-Type'],'image/png');assert.equal(classicArtwork.body.subarray(1,4).toString(),'PNG');
  const themeAsset=await new Promise(resolve=>{const req=Readable.from([]);req.method='GET';req.url='/theme.js';req.headers={};const res={writeHead(status,headers){this.status=status;this.headers=headers},end(body){resolve({status:this.status,headers:this.headers,body})}};server.emit('request',req,res)});
  assert.equal(themeAsset.status,200);assert.match(themeAsset.headers['Content-Type'],/text\/javascript/);assert.match(themeAsset.body.toString(),/hr-future-thinkers-theme-v1/);
  r=await call('/api/setup','POST',{email:'admin@example.org',password:'a-long-password-123'});assert.equal(r.status,403);
  r=await call('/api/setup','POST',{email:'admin@example.org',password:'a-long-password-123'},{'x-setup-key':'test-setup-key'});assert.equal(r.status,201);
  r=await call('/api/register','POST',{email:'learner@example.org',password:'b-long-password-123'});assert.equal(r.status,201);
  r=await call('/api/login','POST',{email:'learner@example.org',password:'b-long-password-123'});assert.equal(r.status,200);
  const cookie=r.headers['set-cookie'].split(';')[0];const csrf=r.body.csrf;
  r=await call('/api/me','GET',null,{cookie});assert.equal(r.body.user.email,'learner@example.org');
  r=await call('/api/learning','POST',{kind:'skill',contentId:'SKILL-001',answer:'Ohne CSRF.'},{cookie});assert.equal(r.status,401);
  r=await call('/api/learning','POST',{kind:'skill',contentId:'BAD',answer:'Falsche ID.'},{cookie,'x-csrf-token':csrf});assert.equal(r.status,400);
  r=await call('/api/learning','POST',{kind:'skill',contentId:'SKILL-001',phase:0,answer:'Eine begründete Arbeitsprobe.'},{cookie,'x-csrf-token':csrf});assert.equal(r.status,201);
  r=await call('/api/export','GET',null,{cookie});assert.equal(r.body.learning.length,1);
  const saved=JSON.parse(await readFile(join(dir,'state.json'),'utf8'));assert.equal(saved.learning.length,1);
  r=await call('/api/delete-account','POST',{confirm:'LÖSCHEN'},{cookie,'x-csrf-token':csrf});assert.equal(r.status,200);
  r=await call('/api/me','GET',null,{cookie});assert.equal(r.status,401);
});
