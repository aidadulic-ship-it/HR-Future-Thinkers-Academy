import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import { catalog } from '../src/content.mjs';

test('GitHub-Pages-Einstieg benutzt relative Assets und vollständigen statischen Katalog', () => {
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const script=readFileSync(new URL('../app.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../app.css',import.meta.url),'utf8');
  const content=JSON.parse(readFileSync(new URL('../content.json',import.meta.url),'utf8'));
  assert.match(html,/data-static-preview="true"/);
  assert.match(html,/href="\.\/app\.css"/);
  assert.match(html,/src="\.\/app\.js"/);
  assert.match(script,/fetch\('\.\/content\.json'\)/);
  assert.match(script,/localStorage\.setItem/);
  assert.match(script,/\.\/assets\/worlds\/\$\{esc\(icon\)\}\.png/);
  assert.match(script,/\.\/assets\/nav\/\$\{icon\}\.svg/);
  assert.match(script,/\.\/assets\/hero-future\.png/);
  assert.match(script,/<span class="hero-art-title">Future HR Lab<\/span>/);
  assert.match(css,/\.hero-art-title\{/);
  assert.match(script,/DIREKT IN DIE LERNARBEIT/);
  assert.match(script,/SKILL-001/);
  assert.match(script,/CASE-001/);
  assert.ok(script.indexOf('${featuredContent()}') < script.indexOf('DEIN FORTSCHRITT'),'Lerninhalte stehen vor den Kennzahlen');
  for (const name of ['horizon','orbit','grid','prism','signal','compass'])
    assert.ok(existsSync(new URL(`../assets/worlds/${name}.png`,import.meta.url)),name);
  for (const name of ['path','worlds','decisions','knowledge','practice','teaching'])
    assert.ok(existsSync(new URL(`../assets/nav/${name}.svg`,import.meta.url)),name);
  assert.ok(existsSync(new URL('../assets/hero-future.png',import.meta.url)));
  assert.ok(existsSync(new URL('../assets/classic-staircase.png',import.meta.url)));
  assert.match(css,/classic-staircase\.png/);
  assert.ok(css.includes('#12295a'));
  for (const key of ['worlds','competencies','skills','cases','perspectives','gameQuestions','assessment','crises'])
    assert.equal(content[key].length,catalog[key].length,key);
});
