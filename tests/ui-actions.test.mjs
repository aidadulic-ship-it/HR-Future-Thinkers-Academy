import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

test('alle deklarierten UI-Aktionen haben Handler', () => {
  const script=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  const actions=new Set([...script.matchAll(/button\([^,]+,'([^']+)'|data-action="([a-z-]+)"/g)].map(m=>m[1]||m[2]));
  for(const action of actions) assert.ok(script.includes(`a==='${action}'`),`Handler fehlt: ${action}`);
});

test('jede Inhaltskarte ist als ganze Fläche per Tastatur und Maus bedienbar', () => {
  const script=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  const esc=script.match(/^const esc = .*$/m)?.[0];
  const card=script.match(/^const card = [\s\S]*?^};/m)?.[0];
  assert.ok(esc&&card);
  const html=runInNewContext(`${esc}\n${card}\ncard('SKILL','Testtitel','Testinhalt','open-skill','SKILL-001','prism')`);
  assert.match(html,/^<button type="button" class="card card-action"/);
  assert.match(html,/data-action="open-skill"/);
  assert.match(html,/Testtitel/);
  assert.match(html,/Testinhalt/);
  assert.equal((html.match(/<button/g)||[]).length,1);
  assert.match(html,/<\/button>$/);
});

test('Übungsinhalt erscheint vor den Einstiegskarten', () => {
  const script=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  const practice=script.match(/^function practicePage\(\).*$/m)?.[0];
  assert.ok(practice);
  assert.ok(practice.indexOf('gamePanel()')<practice.indexOf('card(\'60 FRAGEN'));
  assert.match(script,/a==='show-skills'/);
  assert.match(script,/type:'skills-overview'/);
});
