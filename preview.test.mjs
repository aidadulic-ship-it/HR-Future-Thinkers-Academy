import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

test('die eigenständige Executive-Vorschau führt vom Entscheidungsfall zum Briefing', () => {
  const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /<script[^>]+src=|<link[^>]+stylesheet|id="campus-form"/i);
  assert.match(html, /<img src="data:image\/jpeg;base64,/);
  for (const anchor of ['decision-lab', 'lehre', 'workshops', 'lernangebot']) {
    assert.ok(html.includes('href="#' + anchor + '"') && html.includes('id="' + anchor + '"'), anchor);
  }
  const fields = new Map([
    ['option', 'Begrenzter Pilot'], ['evidence', 'Audit mit kleiner Stichprobe'],
    ['guardrail', 'Stopp bei unklarer Begründung'], ['review', 'HR-Leitung, Tag 30'],
  ]);
  const form = { addEventListener(_, handler) { this.submit = handler; } };
  const output = { hidden: true };
  const brief = { focus() {} };
  const context = {
    window: { addEventListener() {} },
    location: { hash: '' },
    document: { querySelectorAll: () => [], getElementById: () => null, querySelector: id => ({ '#brief-form': form, '#brief-output': output, '#brief-text': brief })[id] },
    FormData: class { get(key) { return fields.get(key); } },
  };
  for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) runInNewContext(script, context);
  form.submit({ preventDefault() {} });
  assert.equal(output.hidden, false);
  for (const value of fields.values()) assert.ok(brief.value.includes(value));
});



test('ein Skill protokolliert die sechs Antworten und stellt sie als Textdatei bereit', () => {
  const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
  const fields = Array.from({ length: 6 }, (_, i) => ({ labels: [{ textContent: 'Schritt ' + (i + 1) }], value: 'Antwort ' + (i + 1) }));
  const record = { focus() {} };
  const download = {};
  const result = { hidden: true, querySelector: selector => selector === '.skill-record' ? record : download };
  const workflow = {
    addEventListener(_, handler) { this.submit = handler; },
    querySelector: selector => selector === '.skill-result' ? result : { textContent: 'Evidence Card' },
    querySelectorAll: () => fields,
  };
  const context = {
    window: { addEventListener() {} },
    location: { hash: '' },
    document: { querySelector: () => ({ addEventListener() {} }), querySelectorAll: () => [workflow], getElementById: () => null },
  };
  for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) runInNewContext(script, context);
  workflow.submit({ preventDefault() {} });
  assert.equal(result.hidden, false);
  for (const field of fields) assert.ok(record.value.includes(field.value));
  assert.equal(decodeURIComponent(download.href.split(',')[1]), record.value);
});



test('die Skill-Suche filtert Titel und Prompt-Text und zeigt die Trefferzahl', () => {
  const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
  const input = { value: '', addEventListener(_, handler) { this.onInput = handler; } };
  const status = {};
  const cards = [{ textContent: 'HR-Technologie auswählen Mehrjahresvergleich' }, { textContent: 'Kultur untersuchen Führung' }];
  const items = { 'skill-search': input, 'skill-search-status': status };
  const context = {
    window: { addEventListener() {} },
    location: { hash: '' },
    document: {
      querySelector: () => ({ addEventListener() {} }),
      querySelectorAll: selector => selector === '#skills .tools > details' ? cards : [],
      getElementById: id => items[id] ?? null,
    },
  };
  assert.ok(html.includes('id="skill-search"'));
  for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) runInNewContext(script, context);
  input.value = 'fuhrung';
  input.onInput();
  assert.deepEqual(cards.map(card => card.hidden), [true, false]);
  assert.equal(status.textContent, '1 von 2 Skills');
  input.value = 'mehrjahresvergleich';
  input.onInput();
  assert.deepEqual(cards.map(card => card.hidden), [false, true]);
  input.value = 'unbekannt';
  input.onInput();
  assert.match(status.textContent, /Keine Skills/);
  input.value = '';
  input.onInput();
  assert.deepEqual(cards.map(card => card.hidden), [false, false]);
});

