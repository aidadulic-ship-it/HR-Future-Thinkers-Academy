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


test('die Workbench exportiert Thema, Entscheidung und Review ohne Server', () => {
  const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
  const fields = [['Thema', 'Recruiting'], ['Einordnung', 'Keep Human'], ['Review-Termin', '2026-12-01']]
    .map(([label, value]) => ({ labels: [{ firstChild: { textContent: label } }], value }));
  const form = { addEventListener(_, handler) { this.submit = handler; }, querySelectorAll: () => fields };
  const record = { focus() {} };
  const result = { hidden: true };
  const download = {};
  const nodes = { 'workbench-form': form, 'workbench-record': record, 'workbench-result': result, 'workbench-download': download };
  const context = {
    window: { addEventListener() {} }, location: { hash: '' },
    document: { querySelector: () => ({ addEventListener() {} }), querySelectorAll: () => [], getElementById: id => nodes[id] ?? null },
  };
  for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) runInNewContext(script, context);
  form.submit({ preventDefault() {} });
  assert.equal(result.hidden, false);
  for (const field of fields) assert.ok(record.value.includes(field.value));
  assert.equal(decodeURIComponent(download.href.split(',')[1]), record.value);
});


test('die Lehrvorschau wechselt zwischen fünf Ansichten und unterstützt Pfeiltasten', () => {
  const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
  const tabs = ['kurs', 'arbeiten', 'entwicklung', 'praxis', 'grill'].map(id => ({
    attributes: { 'aria-controls': 'lehrpanel-' + id },
    getAttribute(key) { return this.attributes[key]; },
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener(event, callback) { this[event] = callback; },
    focus() { this.focused = true; },
  }));
  const panels = Object.fromEntries(tabs.map(tab => [tab.getAttribute('aria-controls'), {}]));
  const nodes = { 'lehrvorschau-tabs': { querySelectorAll: () => tabs }, ...panels };
  const context = {
    window: { addEventListener() {} }, location: { hash: '' },
    document: { querySelector: () => ({ addEventListener() {} }), querySelectorAll: () => [], getElementById: id => nodes[id] ?? null },
  };
  assert.ok(html.includes('id="lehrvorschau-tabs"'));
  for (const id of Object.keys(panels)) assert.ok(html.includes('id="' + id + '"'));
  for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) runInNewContext(script, context);
  tabs[1].click();
  assert.deepEqual(Object.values(panels).map(panel => panel.hidden), [true, false, true, true, true]);
  assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
  tabs[1].keydown({ key: 'ArrowRight', preventDefault() {} });
  assert.deepEqual(Object.values(panels).map(panel => panel.hidden), [true, true, false, true, true]);
  assert.equal(tabs[2].focused, true);
  tabs[3].click();
  assert.deepEqual(Object.values(panels).map(panel => panel.hidden), [true, true, true, false, true]);
  tabs[4].click();
  assert.deepEqual(Object.values(panels).map(panel => panel.hidden), [true, true, true, true, false]);
});


test('Lehre ist ein Tab derselben Academy und unterstützt Direktlinks und Rückkehr', () => {
  const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
  assert.ok(!html.includes('Zugangsmodelle laut Briefing'));
  assert.match(html, /id="nav-lehre"[^>]*href="#lehre"/);
  assert.ok(!html.includes('Lehrendenansicht.html'));
  const home = { hidden: false, closest: () => null };
  const teaching = { hidden: false, closest: selector => selector === '#lehre' ? teaching : null };
  const rubric = { closest: selector => selector === '#lehre' ? teaching : null };
  const nav = { setAttribute(key, value) { this[key] = value; }, removeAttribute(key) { delete this[key]; } };
  const nodes = { start: home, lehre: teaching, 'lehr-rubrik': rubric, inhalt: { children: [home, teaching] }, 'nav-lehre': nav };
  const location = { hash: '#lehr-rubrik' };
  const window = { addEventListener(event, handler) { this[event] = handler; } };
  const document = { querySelector: () => null, querySelectorAll: () => [], getElementById: id => nodes[id] ?? null };
  for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) runInNewContext(script, { document, window, location });
  assert.equal(home.hidden, true);
  assert.equal(teaching.hidden, false);
  assert.equal(nav['aria-current'], 'page');
  location.hash = '#start';
  window.hashchange();
  assert.equal(home.hidden, false);
  assert.equal(teaching.hidden, true);
  assert.equal(nav['aria-current'], undefined);
});



