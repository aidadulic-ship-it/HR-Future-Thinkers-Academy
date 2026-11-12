import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
const css = html.split('<style>')[1].split('</style>')[0];
const views = [...html.matchAll(/^ {4}<(?:section|div)\b[^>]*\bid="([\w-]+)"[^>]*\bdata-view="([\w-]+)"/gm)].map(([, id, view]) => [id, view]);

test('eine Seitenleiste führt in Gruppen zu allen Themen, Home steht ganz oben', () => {
  const aside = html.match(/<aside class="sidebar" id="sidebar"[^>]*>([\s\S]*?)<\/aside>/)?.[1] ?? '';
  const nav = aside.match(/<nav aria-label="Hauptnavigation">([\s\S]*?)<\/nav>/)?.[1] ?? '';
  assert.match(nav, /^\s*<a class="side-link side-home" href="#start"/);
  const groups = [...nav.matchAll(/<(?:p class="side-group"|details class="side-more"><summary class="side-group")>([^<]+)<\/(?:p|summary)>([\s\S]*?)(?=<p class="side-group">|<details class="side-more">|$)/g)];
  assert.deepEqual(groups.map(([, label]) => label), ['Lernen', 'Üben', 'Anwenden', 'Lehren', 'Mehr']);
  const targets = groups.map(([, , links]) => [...links.matchAll(/href="#([\w-]+)"/g)].map(([, id]) => id));
  assert.deepEqual(targets, [['skills', 'prompts', 'perspektiven'], ['fallstudien', 'krisen', 'spiel'], ['decision-lab', 'zeitkapsel', 'workshops'], ['lehre'], ['campus', 'arbeitsweise', 'ueber']]);
  assert.equal((html.match(/<nav\b/g) ?? []).length, 1, 'genau ein Hauptmenü');
  assert.doesNotMatch(html, /class="section-nav"/);
});

test('jedes Thema ist eine eigene Ansicht im Hauptfenster, ohne Skript bleibt alles lesbar', () => {
  const map = Object.fromEntries(views);
  assert.equal(map.start, 'home');
  assert.equal(map.einstieg, 'home');
  for (const id of ['decision-lab', 'skills', 'prompts', 'perspektiven', 'fallstudien', 'krisen', 'spiel', 'zeitkapsel', 'workshops', 'lehre', 'campus', 'arbeitsweise', 'ueber']) assert.equal(map[id], id, id);
  assert.match(css, /\.js-views #inhalt > \[data-view\]:not\(\.is-active\)\s*{\s*display:\s*none/);
  assert.doesNotMatch(html, /<section id="lehre"[^>]*hidden/);
});

test('eine Kopfleiste mit Zurück, Home und Ort, am Handy mit Menüknopf', () => {
  const bar = html.match(/<div class="topbar"[^>]*>([\s\S]*?)<\/div>\s*<main/)?.[1] ?? '';
  assert.match(bar, /<button class="topbar-button" type="button" data-action="menu" aria-controls="sidebar" aria-expanded="false"/);
  assert.match(bar, /data-action="back"[^>]*>[\s\S]*?Zurück/);
  assert.match(bar, /data-action="home"[^>]*>[\s\S]*?Home/);
  assert.match(bar, /<p class="crumb" id="crumb" aria-live="polite">/);
  assert.match(css, /\.sidebar\s*{[^}]*position:\s*sticky/);
  assert.match(css, /@media \(max-width: 900px\)\s*{[^@]*\.sidebar\s*{[^}]*position:\s*fixed/);
});

function makeDom() {
  const ids = {};
  const node = (id, view, extra = {}) => {
    const el = { id, hidden: false, dataset: view ? { view } : {}, classes: new Set(), attrs: {}, scrolled: 0,
      classList: { toggle(name, on) { on ? el.classes.add(name) : el.classes.delete(name); }, add(name) { el.classes.add(name); }, remove(name) { el.classes.delete(name); }, contains: name => el.classes.has(name) },
      setAttribute(k, v) { el.attrs[k] = v; }, removeAttribute(k) { delete el.attrs[k]; }, getAttribute: k => el.attrs[k],
      scrollIntoView() { el.scrolled += 1; }, focus() {}, closest: () => null, ...extra };
    ids[id] = el;
    return el;
  };
  const viewNodes = [node('start', 'home'), node('einstieg', 'home'), node('skills', 'skills'), node('fallstudien', 'fallstudien'), node('krisen', 'krisen')];
  for (const view of viewNodes) view.closest = selector => selector === '#inhalt > [data-view]' ? view : null;
  const caseCard = { open: false, hidden: false, closest: () => null };
  const fall2 = node('fall-2', null, { closest: selector => selector === '#inhalt > [data-view]' ? ids.fallstudien : selector === 'details' ? caseCard : null });
  const links = ['start', 'skills', 'fallstudien', 'krisen'].map(id => node('link-' + id, null, { attrs: { href: '#' + id } }));
  links.forEach(link => { link.getAttribute = k => link.attrs[k]; });
  ids.inhalt = { children: viewNodes };
  ids.crumb = { textContent: '' };
  const backButton = node('back', null);
  const scrolls = [];
  const document = {
    documentElement: { classList: { add() {} }, style: {} },
    getElementById: id => ids[id] ?? null,
    querySelector: selector => selector === '[data-action="back"]' ? backButton : null,
    querySelectorAll: selector => selector === '#inhalt > [data-view]' ? viewNodes : selector === '.sidebar a[href^="#"]' ? links : [],
    addEventListener() {},
  };
  const window = { addEventListener() {}, scrollTo: (x, y) => scrolls.push(y), scrollY: 0, innerHeight: 800 };
  return { document, window, ids, viewNodes, caseCard, fall2, links, scrolls, backButton };
}

test('Klick zeigt nur das gewählte Thema, Zurück führt zur vorherigen Ansicht, Home zur Startseite', () => {
  const dom = makeDom();
  const context = { document: dom.document, window: dom.window, location: { hash: '' }, history: { pushState() {}, replaceState() {} }, setTimeout() {} };
  for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) runInNewContext(script, context);
  const active = () => dom.viewNodes.filter(view => view.classes.has('is-active')).map(view => view.id);
  assert.deepEqual(active(), ['start', 'einstieg'], 'Start zeigt Home');
  context.navigate('krisen');
  assert.deepEqual(active(), ['krisen']);
  assert.equal(dom.links.find(link => link.id === 'link-krisen').attrs['aria-current'], 'page');
  assert.match(dom.ids.crumb.textContent, /Krisen|krisen/i);
  context.navigate('fall-2');
  assert.deepEqual(active(), ['fallstudien']);
  assert.equal(dom.caseCard.open, true, 'Unterziel öffnet seine Karte');
  context.goBack();
  assert.deepEqual(active(), ['krisen']);
  context.goBack();
  assert.deepEqual(active(), ['start', 'einstieg']);
  context.navigate('skills');
  context.navigate('start');
  assert.deepEqual(active(), ['start', 'einstieg']);
});

test('jeder Eintrag der Seitenleiste hat ein Symbol und eine kompakte Höhe, „Mehr“ ist einklappbar', () => {
  const nav = html.match(/<nav aria-label="Hauptnavigation">([\s\S]*?)<\/nav>/)[1];
  const links = [...nav.matchAll(/<a class="side-link[^"]*"[^>]*>([\s\S]*?)<\/a>/g)];
  assert.equal(links.length, 14);
  for (const [, inner] of links) assert.match(inner, /^<svg viewBox="0 0 24 24" aria-hidden="true">/);
  assert.match(nav, /<details class="side-more"><summary class="side-group">Mehr<\/summary>/);
  assert.match(nav, /<a class="side-link" href="#spiel">[\s\S]*?HR-Mastermind<\/span><\/a>/);
  assert.match(css, /\.side-link\s*{[^}]*min-height:\s*38px/);
});

test('lange Themen sind in Reiter geteilt: Skills und Für Lehrende', () => {
  const tabs = id => [...(html.split('<section id="' + id + '"')[1].split('</section>')[0].match(/<div class="subnav" role="tablist"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? '').matchAll(/<button type="button" role="tab" data-subview-tab="([\w-]+)"[^>]*>([^<]+)<\/button>/g)].map(([, key, label]) => key + ':' + label);
  assert.deepEqual(tabs('skills'), ['alle:Alle Skills', 'wahl:Welcher Skill passt?']);
  assert.deepEqual(tabs('lehre'), ['kurs:Kursarbeitsplatz', 'fahrplan:30-Tage-Lernfahrplan', 'material:Lehrplan und Rubrik']);
  const skills = html.split('<section id="skills"')[1].split('</section>')[0];
  assert.ok(skills.indexOf('data-subview="alle"') < skills.indexOf('data-subview="wahl"'), 'Skill-Karten kommen zuerst');
  assert.ok(skills.split('data-subview="wahl"')[1].includes('id="methodenwahl"'));
  const lehre = html.split('<section id="lehre"')[1].split('</section>')[0];
  assert.ok(lehre.split('data-subview="fahrplan"')[1].trimStart().startsWith('>') || lehre.includes('data-subview="fahrplan"'));
  assert.match(css, /\.js-views \[data-subview\]:not\(\.is-active\)\s*{\s*display:\s*none/);
  assert.match(css, /\.subnav\s*{\s*display:\s*none/);
});

test('jede Ansicht beginnt gleich und endet mit Vorher und Weiter, die Startseite ist kompakt', () => {
  assert.match(html, /<section id="skills" data-view="skills" class="wrap catalog"><p class="eyebrow">LERNEN · SKILLS<\/p><h2>20 HR-AI-Skills<\/h2>/);
  const script = html.match(/<script>([\s\S]*?)<\/script>/g).join('');
  assert.match(script, /function buildPager\(/);
  assert.match(script, /'view-pager'/);
  assert.match(script, /›/);
  assert.match(script, /heading\.focus\(\{ preventScroll: true \}\)/);
  assert.match(script, /function trapMenuFocus\(/);
  assert.match(css, /\.js-views \.hero\s*{[^}]*min-height:\s*0/);
});

test('Unterziele öffnen den richtigen Reiter', () => {
  const dom = makeDom();
  const tabPanel = { dataset: { subview: 'material' }, classList: { toggle() {}, add() {}, remove() {}, contains: () => false } };
  dom.caseCard.closest = () => null;
  dom.fall2.closest = selector => selector === '#inhalt > [data-view]' ? dom.ids.fallstudien : selector === 'details' ? dom.caseCard : selector === '[data-subview]' ? tabPanel : null;
  const shown = [];
  const context = { document: dom.document, window: dom.window, location: { hash: '' }, history: { pushState() {}, replaceState() {} }, setTimeout() {} };
  for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) runInNewContext(script, context);
  context.showSubview = (view, key) => shown.push(view.id + ':' + key);
  context.navigate('fall-2');
  assert.deepEqual(shown, ['fallstudien:material']);
});
