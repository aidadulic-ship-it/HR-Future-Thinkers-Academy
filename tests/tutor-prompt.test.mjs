import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { catalog } from '../src/content.mjs';

const render = expression => {
  const raw = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const script = raw.slice(0, raw.lastIndexOf('try{state.catalog=await api'));
  const element = { innerHTML: '', textContent: '', style: {}, classList: { remove() {}, toggle() {} }, addEventListener() {} };
  const context = { catalog, document: { documentElement: { dataset: { staticPreview: 'true' } }, querySelector() { return element; }, addEventListener() {} },
    localStorage: { getItem() { return null; } }, setTimeout() {}, window: { scrollTo() {} } };
  return runInNewContext(`${script}\nstate.catalog=catalog; ${expression}`, context);
};
const tutor = () => catalog.prompts.find(p => p.id === 'PROMPT-21');

test('Lern-Tutor: Der Prompt steht vollständig und unverändert im Katalog', () => {
  const t = tutor();
  assert.ok(t, 'PROMPT-21 fehlt');
  assert.equal(t.slug, 'progressive-overload-tutor');
  for (const part of ['Agiere als mein persönlicher Tutor für das Konzept: [Thema/Konzept].', 'Doziere nicht', 'Progressive Overload',
    'Level 1: Befrage mich wie einen Schüler.', 'Level 2: Befrage mich wie einen Studenten.',
    'Level 3: Befrage mich streng wie in einem Vorstellungsgespräch für eine Führungsposition.',
    'Level 4: Fordere mich heraus wie ein kritischer Chef, der glaubt, ich sei unvorbereitet.',
    'Stelle immer nur eine Frage auf einmal und passe das Level meiner Antwort an.'])
    assert.ok(t.prompt.includes(part), part);
  assert.doesNotMatch(t.prompt, /\[48\]/);
  assert.equal(t.steps.length, 4);
  assert.equal(t.stepsTitle, 'Vier Level');
});

test('Lern-Tutor: Er erscheint in der Prompt Library und als eigene Karte im Practice Studio', () => {
  const page = render(`state.page='practice'; state.selected=null; practicePage()`);
  assert.match(page, /data-action="open-prompt"[^>]*data-id="PROMPT-21"/);
  assert.match(page, /Lern-Tutor/);
  assert.equal((page.match(/data-id="PROMPT-21"/g) || []).length, 2);
  assert.doesNotMatch(page, /20 PROMPTS|und 17 weitere/);
  assert.match(page, /21 PROMPTS/);
});

test('Lern-Tutor: Die Detailansicht zeigt Prompt, vier Level und Kopieren/Speichern ohne falsche Herkunftsangabe', () => {
  const panel = render(`state.page='practice'; state.selected={type:'prompt',id:'PROMPT-21'}; promptPanel()`);
  assert.match(panel, /Agiere als mein persönlicher Tutor/);
  assert.match(panel, /Vier Level/);
  assert.doesNotMatch(panel, /Sechs Arbeitsschritte/);
  assert.doesNotMatch(panel, /FRÜHERER ACADEMY-STAND/);
  assert.match(panel, /data-action="copy-prompt"/);
  assert.match(panel, /data-action="download-prompt"/);
  assert.doesNotMatch(panel, /open-case/);
});

test('Original-Prompts behalten ihre Darstellung', () => {
  const panel = render(`state.page='practice'; state.selected={type:'prompt',id:'PROMPT-01'}; promptPanel()`);
  assert.match(panel, /Sechs Arbeitsschritte/);
  assert.match(panel, /FRÜHERER ACADEMY-STAND/);
});

test('GitHub Pages: content.json entspricht dem Katalog und beide App-Dateien nutzen die datengesteuerten Texte', () => {
  assert.deepEqual(JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8')), JSON.parse(JSON.stringify(catalog)));
  for (const file of ['../app.js', '../src/app.js']) {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.match(source, /x\.stepsTitle/, file); assert.match(source, /PROMPT-21/, file);
    assert.doesNotMatch(source, /20 PROMPTS|und 17 weitere/, file);
  }
});
