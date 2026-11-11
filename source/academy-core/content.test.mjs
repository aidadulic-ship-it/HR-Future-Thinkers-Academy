import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('beide Kataloge liefern aufklappbare Lerninhalte in der ausgelieferten Vorschau', () => {
  const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
  for (const [id, count] of [['skills', 20], ['perspektiven', 12]]) {
    assert.ok(html.includes('href="#' + id + '"'));
    const section = html.split('<section id="' + id + '"')[1]?.split('</section>')[0];
    assert.ok(section);
    assert.equal([...section.matchAll(/<details>/g)].length, count);
    assert.equal([...section.matchAll(/<strong>Praxisaufgabe<\/strong>/g)].length, count);
  }
});


test('der Workshop ist über die Navigation erreichbar und enthält den ausgearbeiteten Ablauf', () => {
  const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
  assert.match(html, /href="#workshops"/);
  const workshop = html.split('<section id="workshops"')[1]?.split('</section>')[0];
  assert.ok(workshop);
  for (const step of ['Evidence Card', 'Gegenposition', 'UNLEARN-Frage', 'Automate', 'Augment', 'Keep Human', 'Stop', '30-Tage-Test', 'Review-Termin']) {
    assert.ok(workshop.includes(step), step);
  }
  assert.match(workshop, /https:\/\/hr-unlearn-it-workbench\.a-dulic\.chatgpt\.site/);
});


test('Masterbriefing: 20 ausführbare Skill-Workflows und acht synthetische Fälle', () => {
  const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
  const workflows = [...html.matchAll(/<form class="skill-workflow" data-skill="([^"]+)">([\s\S]*?)<\/form>/g)];
  assert.equal(workflows.length, 20);
  assert.equal(new Set(workflows.map(([, slug]) => slug)).size, 20);
  for (const [, slug, workflow] of workflows) {
    assert.equal([...workflow.matchAll(/<textarea name="step-/g)].length, 6, slug);
    assert.ok(workflow.includes('type="submit"'), slug);
  }
  assert.equal([...html.matchAll(/<details id="fall-/g)].length, 8);
});


test('die didaktischen Modi sind einzeln aufklappbar und enthalten Ablauf, Beispiel und Bewertung', () => {
  const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
  const modes = [...html.matchAll(/<details class="learning-mode"><summary>([^<]+)<\/summary>([\s\S]*?)<\/details>/g)];
  assert.deepEqual(modes.map(([, title]) => title), ['Human First', 'Human × AI', 'Human Only']);
  for (const [, title, body] of modes) {
    for (const label of ['Ablauf', 'HR-Beispiel', 'Bewertung']) assert.ok(body.includes(label), title + ' · ' + label);
  }
});

