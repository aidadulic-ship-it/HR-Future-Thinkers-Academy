import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
const css = html.split('<style>')[1]?.split('</style>')[0] ?? '';
const section = id => html.split('<section id="' + id + '"')[1]?.split('</section>')[0] ?? '';
const VERBS = ['entdecken', 'hinterfragen', 'analysieren', 'entscheiden', 'reflektieren'];

test('Schriften sind eingebettet, inklusive Latin-Extended für Đ und ć, und die Laufweite ist lesbar', () => {
  for (const family of ['Instrument Serif', 'DM Sans']) {
    const faces = [...css.matchAll(/@font-face\s*{[^}]*}/g)].map(([face]) => face).filter(face => face.includes('"' + family + '"'));
    assert.ok(faces.length >= 2, family);
    for (const face of faces) assert.match(face, /src: url\("data:font\/woff2;base64,/, family);
    assert.ok(faces.some(face => face.includes('U+0100-02BA')), family + ' latin-ext');
  }
  assert.doesNotMatch(html, /fonts\.googleapis|fonts\.gstatic/);
  for (const [, value] of css.matchAll(/letter-spacing:\s*(-[\d.]+)em/g)) assert.ok(Number(value) >= -0.03, value);
});

test('Sprache, Bildbeschreibung und Name sind korrekt', () => {
  assert.match(html, /<html lang="de-AT">/);
  assert.match(html, /<img src="data:image\/jpeg;base64,[^"]+" alt="[^"]{10,}"/);
  const footer = html.split('<footer')[1]?.split('</footer>')[0] ?? '';
  assert.ok(footer.includes('Aida Đulić'));
  assert.ok(!html.includes('Aida Dulic'));
});

test('eine Einstiegsweiche nach dem Hero führt zu Skills, Lehre und Workshop', () => {
  const start = html.indexOf('<section class="hero');
  const entry = html.indexOf('<section id="einstieg"');
  assert.ok(entry > start && entry < html.indexOf('<section id="decision-lab"'));
  const block = section('einstieg');
  const targets = [...block.matchAll(/<a class="entry-card" href="#([\w-]+)"/g)].map(([, target]) => target);
  assert.deepEqual(targets, ['skills', 'lehre', 'workshops', 'zeitkapsel', 'krisen']);
  for (const target of targets) assert.ok(html.includes('id="' + target + '"'), target);
});

test('das Decision Lab zeigt zuerst ein fertiges, synthetisch gekennzeichnetes Ergebnis', () => {
  const lab = section('decision-lab');
  const trace = lab.split('id="decision-trace-beispiel"')[1]?.split('</article>')[0];
  assert.ok(trace);
  assert.ok(trace.includes('Synthetischer Fall'));
  for (const label of ['Ausgangslage', 'Annahme', 'Gegenargument', 'Evidenz', 'Entscheidung', 'Review']) assert.ok(trace.includes('<dt>' + label + '</dt>'), label);
  assert.ok(lab.indexOf('decision-trace-beispiel') < lab.indexOf('id="brief-form"'));
});

test('Skills erscheinen als Karten mit Ziel, Ergebnis und genau einer von fünf Tätigkeiten', () => {
  const skills = [...section('skills').matchAll(/<details data-verb="([a-z]+)"><summary id="([\w-]+)">([\s\S]*?)<\/summary>/g)];
  assert.equal(skills.length, 20);
  for (const verb of VERBS) assert.equal(skills.filter(([, v]) => v === verb).length, 4, verb);
  for (const [, , slug, summary] of skills) {
    for (const part of ['card-kicker', 'card-title', 'card-goal', 'card-output']) assert.ok(summary.includes('class="' + part + '"'), slug + ' · ' + part);
  }
  const chips = [...section('skills').matchAll(/<button type="button" data-filter="([a-z]+)" aria-pressed="(true|false)">/g)];
  assert.deepEqual(chips.map(([, value]) => value), ['alle', ...VERBS]);
  assert.equal(chips.filter(([, , pressed]) => pressed === 'true').length, 1);
});

test('Tätigkeitsfilter und Suche wirken gemeinsam', () => {
  const chipNodes = ['alle', 'hinterfragen', 'analysieren'].map(filter => ({
    dataset: { filter },
    attributes: {},
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener(_, handler) { this.click = handler; },
  }));
  const cards = [
    { dataset: { verb: 'hinterfragen' }, textContent: 'Annahmen kritisch hinterfragen Recruiting' },
    { dataset: { verb: 'analysieren' }, textContent: 'Wissenschaftliche Aussagen Recruiting' },
    { dataset: { verb: 'hinterfragen' }, textContent: 'Kultur untersuchen Führung' },
  ];
  const input = { value: '', addEventListener(_, handler) { this.onInput = handler; } };
  const status = {};
  const nodes = { 'skill-search': input, 'skill-search-status': status };
  const context = {
    window: { addEventListener() {} }, location: { hash: '' },
    document: {
      querySelector: () => null,
      querySelectorAll: selector => selector === '#skills .tools > details' ? cards : selector === '#skill-filter [data-filter]' ? chipNodes : [],
      getElementById: id => nodes[id] ?? null,
    },
  };
  for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) runInNewContext(script, context);
  chipNodes[1].click();
  assert.deepEqual(cards.map(card => card.hidden), [false, true, false]);
  assert.equal(chipNodes[1].attributes['aria-pressed'], 'true');
  assert.equal(chipNodes[0].attributes['aria-pressed'], 'false');
  input.value = 'recruiting';
  input.onInput();
  assert.deepEqual(cards.map(card => card.hidden), [false, true, true]);
  assert.equal(status.textContent, '1 von 3 Skills');
  chipNodes[0].click();
  assert.deepEqual(cards.map(card => card.hidden), [false, false, true]);
});

test('Perspektiven und Fälle sind Karten mit sichtbarem Thema', () => {
  const thinkers = [...section('perspektiven').matchAll(/<summary><span class="card-title">([^<]+)<\/span><span class="card-goal">([^<]+)<\/span>/g)];
  assert.equal(thinkers.length, 12);
  const cases = [...section('fallstudien').matchAll(/<details id="fall-(\d)"><summary><span class="card-kicker">Fall \1<\/span><span class="card-title">([^<]+)<\/span>/g)];
  assert.equal(cases.length, 8);
});

test('Layout: Seitenleiste, Kartenraster und Klickflächen ab 44 Pixel', () => {
  assert.match(css, /\.sidebar nav\s*{[^}]*flex-direction:\s*column/);
  assert.match(css, /\.card-grid\s*{[^}]*display:\s*grid/);
  assert.match(css, /\.card-grid > details\[open\]\s*{[^}]*grid-column:\s*1 \/ -1/);
  assert.match(css, /summary\s*{[^}]*min-height:\s*44px/);
  for (const id of ['skills', 'perspektiven', 'fallstudien']) assert.match(section(id), /<div class="tools card-grid">/, id);
});

test('Grill-me heißt im Lehrenden-Tab eindeutig nach seinem Inhalt', () => {
  assert.match(html, /aria-controls="lehrpanel-grill"[^>]*>Grill-me · 12 Perspektiven<\/button>/);
});
