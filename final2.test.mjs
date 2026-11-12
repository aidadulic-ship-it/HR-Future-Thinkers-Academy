import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
const section = id => html.split('<section id="' + id + '"')[1]?.split('</section>')[0] ?? '';

test('die Startseite ist gekürzt: kein doppeltes Lernangebot, Workbench liegt hinter einem Öffner', () => {
  assert.ok(!html.includes('<section id="lernangebot"'));
  assert.ok(!html.includes('href="#lernangebot"'));
  const workshop = section('workshops');
  const box = workshop.split(/<details class="workbench-details"[^>]*>/)[1]?.split('</details>')[0] ?? '';
  assert.match(box, /^<summary>[^<]*Workbench öffnen/);
  assert.ok(box.includes('id="workbench-form"'));
  assert.ok(!/<details class="workbench-details" open/.test(workshop));
});

test('Werkzeuge in Entwicklung sind kompakt und als solche gekennzeichnet', () => {
  const tools = section('arbeitsweise');
  assert.match(tools, /<h2>In Entwicklung<\/h2>/);
  assert.equal([...tools.matchAll(/<details><summary><span class="card-kicker">In Entwicklung<\/span>/g)].length, 5);
  assert.ok(!tools.includes('<details open>'));
});

test('Über die Academy schafft Vertrauen und beschreibt den Umgang mit Daten und KI', () => {
  const about = section('ueber');
  assert.ok(about.includes('Aida Đulić, B.A.'));
  assert.ok(about.includes('unabhängige Initiative'));
  assert.ok(about.includes('Daten und KI'));
  for (const fact of ['ohne Konto', 'nicht übertragen', 'eigenen KI-Tool', 'synthetische']) assert.ok(about.includes(fact), fact);
  assert.ok(!/Partner(schaft)? (der|mit) .*(Universität|Hochschule|FH)/.test(about));
  assert.ok(html.indexOf('<section id="ueber"') > html.indexOf('<section id="campus"'));
  assert.match(section('einstieg'), /class="privacy-note"[^>]*>[^<]*nicht übertragen/);
});

test('drei empfohlene Einstiegs-Skills führen direkt in ihre Workflows', () => {
  const start = section('skills').split('class="skill-start"')[1]?.split('</div>')[0] ?? '';
  const targets = [...start.matchAll(/href="#([\w-]+)"/g)].map(([, id]) => id);
  assert.deepEqual(targets, ['grill-me', 'evidence-check', 'hr-decision-lab']);
});

test('einheitliches Kartenmuster in Workshop und Campus, einheitliche Kicker', () => {
  assert.match(section('workshops'), /<div class="tools card-grid">/);
  assert.match(section('campus'), /<div class="card-grid modes-grid">/);
  assert.ok(!html.includes('>WORKSHOPS<'));
  assert.ok(!html.includes('Academy entdecken <span aria-hidden="true">↗'));
});

test('der Workshop heißt Reality Check, der frühere Begriff kommt nicht mehr vor', () => {
  assert.doesNotMatch(html, /unlearn/i);
  assert.match(html, /<a class="side-link" href="#workshops">[\s\S]*?Reality Check<\/span><\/a>/);
  assert.match(section('workshops'), /<h2>Reality Check<\/h2>/);
  assert.ok(html.includes("'REALITY CHECK · WORKSHOP-PROTOKOLL'"));
  assert.ok(html.includes('download="Reality-Check-Workshop.txt"'));
});

test('die drei Lernmodi zeigen schon geschlossen, wofür sie gedacht sind', () => {
  const modes = [...section('campus').matchAll(/<details class="learning-mode"><summary><span class="card-kicker">Lernmodus<\/span><span class="card-title">([^<]+)<\/span><span class="card-goal">([^<]{30,})<\/span><span class="card-cta" aria-hidden="true"><\/span><\/summary>/g)];
  assert.deepEqual(modes.map(([, title]) => title), ['Human First', 'Human × AI', 'Human Only']);
});

test('die Academy sagt klar, dass kein KI-Konto nötig ist', () => {
  assert.match(section('einstieg'), /class="privacy-note"[^>]*>[^<]*ohne KI-Konto/);
  assert.match(html, /<p class="prompt-where">KI-Prompt \(optional\)/);
});

test('die Academy spricht für sich: keine Werbebegriffe auf der Seite', () => {
  assert.doesNotMatch(html.replace(/data:[^"')]+/g, ''), /masterclass|high[\s-]?end|executive[\s-]?level|premium/i);
});
