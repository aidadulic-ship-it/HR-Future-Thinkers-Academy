import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const game = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
const academy = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
const REAL_NAMES = /wirecard|volkswagen|\bVW\b|dieselgate|better\.com|\buber\b|theranos|enron|siemens|braun|marsalek/i;
function logic() {
  const context = { window: { addEventListener() {}, matchMedia: () => ({ matches: true }) }, document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} }, requestAnimationFrame() {}, setInterval() {}, clearInterval() {}, location: { hash: '' } };
  runInNewContext(game.match(/<script data-part="spiel">([\s\S]*?)<\/script>/)[1], context);
  return context;
}

test('drei erfundene Krisenfälle mit je vier Phasen und genau einer besten Reaktion', () => {
  const { CRISES } = logic();
  assert.equal(CRISES.length, 3);
  for (const crisis of CRISES) {
    assert.ok(crisis.title && crisis.setting && crisis.lessons.length >= 3, crisis.title);
    assert.equal(crisis.phases.length, 4, crisis.title);
    for (const phase of crisis.phases) {
      assert.ok(phase.situation.length > 40 && phase.question.endsWith('?'), phase.question);
      assert.equal(phase.options.length, 4, phase.question);
      assert.equal(phase.options.filter(o => o.quality === 'best').length, 1, phase.question);
      for (const option of phase.options) assert.ok(option.text && option.consequence.length > 30, option.text);
    }
  }
});

test('Entscheidungen verändern Vertrauen und Risiko in Grenzen und ergeben ein Gesamtbild', () => {
  const { createCrisisRun, chooseCrisisOption, crisisVerdict } = logic();
  const run = createCrisisRun();
  assert.deepEqual([run.trust, run.risk], [50, 50]);
  for (let i = 0; i < 4; i++) chooseCrisisOption(run, { quality: 'best' });
  assert.equal(run.trust, 100);
  assert.equal(run.risk, 0);
  assert.match(crisisVerdict(run).title, /gemeistert/);
  const bad = createCrisisRun();
  for (let i = 0; i < 5; i++) chooseCrisisOption(bad, { quality: 'bad' });
  assert.equal(bad.trust, 0);
  assert.equal(bad.risk, 100);
  assert.match(crisisVerdict(bad).title, /eskaliert/);
});

test('Krisenmodus ist vom Start aus und per Direktlink erreichbar, mit Hinweis auf Fiktion', () => {
  assert.match(game, /id="crisis-button"/);
  assert.match(game, /id="screen-crisis-select"/);
  assert.match(game, /frei erfunden/i);
  assert.match(game, /keine Rechtsberatung/i);
  assert.doesNotMatch(game.replace(/data:[^"')]+/g, ''), REAL_NAMES);
});

test('die Academy zeigt die Krisenfälle mit Phasen, Leitfragen und Weg ins Spiel', () => {
  const section = academy.split('<section id="krisen"')[1]?.split('</section>')[0] ?? '';
  const cases = [...section.matchAll(/<details id="krise-(\d)">([\s\S]*?)<\/details>/g)];
  assert.equal(cases.length, 3);
  for (const [, nr, body] of cases) {
    assert.equal([...body.matchAll(/<li><strong>Phase \d/g)].length, 4, 'krise-' + nr);
    assert.ok(body.includes('href="#spiel-krise-' + nr + '"'), 'krise-' + nr);
    assert.match(body, /Passende Skills/);
  }
  assert.match(section, /frei erfunden/i);
  assert.match(academy, /<a href="#krisen">/);
  assert.doesNotMatch(academy.replace(/data:[^"')]+/g, ''), REAL_NAMES);
});

test('die beste Antwort verrät sich nicht durch ihre Länge', () => {
  const { CRISES } = logic();
  let bestLongest = 0;
  for (const crisis of CRISES) for (const phase of crisis.phases) {
    const lengths = phase.options.map(o => o.text.length);
    assert.ok(Math.max(...lengths) / Math.min(...lengths) <= 1.45, phase.question + ' ' + lengths);
    if (phase.options.find(o => o.quality === 'best').text.length === Math.max(...lengths)) bestLongest += 1;
  }
  assert.ok(bestLongest <= 4, 'beste Antwort ist in ' + bestLongest + ' von 12 Phasen die längste');
});

test('Krisenmodus: Erklärung am Start, klickbare Themenkarten, Tasten 1 bis 4', () => {
  const start = game.split('id="screen-start"')[1].split('</section>')[0];
  assert.match(start, /class="crisis-teaser"[^>]*>[\s\S]*?Krisenmodus[\s\S]*?Minuten/);
  const { CRISES } = logic();
  for (const crisis of CRISES) assert.ok(crisis.topic && crisis.topic.length < 30, crisis.title);
  const script = game.match(/<script data-part="spiel">([\s\S]*?)<\/script>/)[1];
  assert.match(script, /'case-tab', crisis\.topic/);
  assert.match(script, /Fall spielen/);
  assert.match(script, /screen-crisis'\)\.hidden/);
});

test('Anzeigen sind zugänglich, zeigen die Veränderung und erklären das Ziel', () => {
  for (const id of ['meter-trust', 'meter-risk']) assert.match(game, new RegExp('role="meter"[^>]*id="' + id + '-bar"|id="' + id + '-bar"[^>]*role="meter"'));
  assert.match(game, /id="meter-trust-delta"/);
  assert.match(game, /id="meter-risk-delta"/);
  assert.match(game, /Ziel: Vertrauen hoch, Risiko niedrig/);
  assert.match(game.match(/<script data-part="spiel">([\s\S]*?)<\/script>/)[1], /setAttribute\('aria-valuenow'/);
  const css = game.split('<style>')[1].split('</style>')[0];
  assert.doesNotMatch(css.match(/\.meter-fill\.risk\s*{[^}]*}/)[0], /magenta/);
});

test('Firmenbeschreibung ab Phase 2 eingeklappt, Rückblick am Ende, Vertiefen als Hauptknopf', () => {
  assert.match(game, /<details class="crisis-setting" id="crisis-setting-box"/);
  assert.match(game, /<ol class="crisis-recap" id="crisis-recap"/);
  assert.match(game, /<a class="button" id="crisis-academy"/);
  assert.match(game, /id="crisis-again" type="button"[^>]*>|class="button button-ghost" id="crisis-again"/);
  const css = game.split('<style>')[1].split('</style>')[0];
  assert.match(css, /#screen-crisis-end\s*{[^}]*background:\s*var\(--navy/);
});

test('Academy: Krisenfälle in der Einstiegsweiche, Nutzen vor Rechtshinweis, Leitfrage auf jeder Karte', () => {
  const entry = academy.split('<section id="einstieg"')[1].split('</section>')[0];
  assert.match(entry, /<a class="entry-card" href="#krisen"/);
  const section = academy.split('<section id="krisen"')[1].split('</section>')[0];
  const intro = section.split('<div class="tools')[0];
  assert.doesNotMatch(intro.match(/<p>([^<]*)/)?.[1] ?? '', /^Drei Ausnahmesituationen in vier Phasen\. Die Fälle sind frei erfunden/);
  assert.doesNotMatch(section, /Wie soll HR reagieren\?<\/span>/);
  assert.match(section, /<div class="tools card-grid crisis-grid">/);
});
