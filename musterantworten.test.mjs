import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
const forms = [...html.matchAll(/<form class="skill-workflow" data-skill="([^"]+)">([\s\S]*?)<\/form>/g)];

test('jeder Schritt aller 20 Skills hat eine Musterantwort aus einer fachlichen Perspektive', () => {
  assert.equal(forms.length, 20);
  const lenses = new Set();
  for (const [, slug, body] of forms) {
    const answers = [...body.matchAll(/<details class="model-answer" data-step="(\d)"><summary>Mit Musterantwort vergleichen<\/summary><p class="model-lens">Blickwinkel: ([^<]+), angelehnt an das Academy-Profil ([^<]+)<\/p><p>([^<]{60,})<\/p><\/details>/g)];
    assert.deepEqual(answers.map(([, step]) => step), ['1', '2', '3', '4', '5', '6'], slug);
    for (let step = 1; step <= 6; step++) {
      assert.ok(body.indexOf('name="step-' + step + '"') < body.indexOf('data-step="' + step + '"'), slug + ' Schritt ' + step);
    }
    for (const [, , , profile, text] of answers) {
      lenses.add(profile);
      assert.doesNotMatch(text, new RegExp(profile.split(' ').at(-1) + '\\s+(sagt|meint|würde sagen|betont)'), slug);
    }
  }
  assert.equal(lenses.size, 12);
  assert.match(html, /Musterantworten sind Lernbeispiele der Academy/);
});

test('Musterantworten öffnen sich erst nach eigener Antwort zum jeweiligen Schritt', () => {
  const field = { value: '' };
  const answer = { hidden: false, open: true };
  const workflow = {
    listeners: {},
    addEventListener(event, handler) { this.listeners[event] = handler; },
    querySelector: selector => selector === '[name="step-3"]' ? field : null,
    querySelectorAll: selector => selector === '.model-answer' ? [Object.assign(answer, { dataset: { step: '3' } })] : [],
  };
  const context = { window: { addEventListener() {} }, location: { hash: '' }, document: { querySelector: () => null, querySelectorAll: s => s === '.skill-workflow' ? [workflow] : [], getElementById: () => null } };
  for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) runInNewContext(script, context);
  assert.equal(answer.hidden, true);
  field.value = 'Kurze Notiz';
  workflow.listeners.input();
  assert.equal(answer.hidden, true);
  field.value = 'Meine eigene Antwort mit ausreichend Inhalt zum Vergleichen.';
  workflow.listeners.input();
  assert.equal(answer.hidden, false);
});
