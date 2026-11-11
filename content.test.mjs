import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('beide Kataloge liefern aufklappbare Lerninhalte in der ausgelieferten Vorschau', () => {
  const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
  for (const [id, count] of [['skills', 20], ['perspektiven', 12]]) {
    assert.ok(html.includes('href="#' + id + '"'));
    const section = html.split('<section id="' + id + '"')[1]?.split('</section>')[0];
    assert.ok(section);
    assert.equal([...section.matchAll(/<details(?: data-verb="[a-z]+")?>/g)].length, count);
    assert.equal([...section.matchAll(/<strong>Praxisaufgabe<\/strong>/g)].length, count);
  }
});


test('der Workshop ist über die Navigation erreichbar und enthält den ausgearbeiteten Ablauf', () => {
  const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
  assert.match(html, /href="#workshops"/);
  const workshop = html.split('<section id="workshops"')[1]?.split('</section>')[0];
  assert.ok(workshop);
  for (const step of ['Evidence Card', 'Gegenposition', 'Umdenk-Frage', 'Automate', 'Augment', 'Keep Human', 'Stop', '30-Tage-Test', 'Review-Termin']) {
    assert.ok(workshop.includes(step), step);
  }
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
  const modes = [...html.matchAll(/<details class="learning-mode"><summary>[\s\S]*?<span class="card-title">([^<]+)<\/span>[\s\S]*?<\/summary>([\s\S]*?)<\/details>/g)];
  assert.deepEqual(modes.map(([, title]) => title), ['Human First', 'Human × AI', 'Human Only']);
  for (const [, title, body] of modes) {
    for (const label of ['Ablauf', 'HR-Beispiel', 'Bewertung']) assert.ok(body.includes(label), title + ' · ' + label);
  }
});


test('jeder Skill hat einen eigenen kopierbaren KI-Prompt in seinem Workflow', () => {
  const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
  const skills = [...html.matchAll(/<form class="skill-workflow" data-skill="([\w-]+)">([\s\S]*?)<\/form>/g)];
  assert.equal(skills.length, 20);
  const prompts = skills.map(([, slug, content]) => {
    const prompt = content.match(/<textarea id="prompt-[\w-]+" rows="9" readonly>([\s\S]*?)<\/textarea>/)?.[1];
    assert.ok(prompt, slug);
    for (const marker of ['[Fall oder Kontext]', '[Meine Vorarbeit]', 'Prüffrage', 'Ergebnisformat']) assert.ok(prompt.includes(marker), slug + ' · ' + marker);
    return prompt;
  });
  assert.equal(new Set(prompts).size, 20);
});


test('Reality Check ist in der Academy ohne externen Anmeldelink nutzbar', () => {
  const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
  const workshop = html.split('<section id="workshops"')[1]?.split('</section>')[0];
  assert.ok(workshop?.includes('id="workbench-form"'));
  assert.ok(workshop.includes('id="literacy"'));
  assert.ok(!workshop.includes('chatgpt.site'));
});


test('Workbench-Felder haben direkt zugeordnete Hinweise ohne Fragezeichen-Schaltflächen', () => {
  const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
  const fields = html.split('id="workbench-form"')[1]?.split('</form>')[0];
  assert.equal([...fields.matchAll(/class="field-note" id="help-w\d+"/g)].length, 14);
  assert.equal([...fields.matchAll(/aria-describedby="help-w\d+"/g)].length, 14);
  assert.ok(!html.includes('class="help-toggle"'));
});

test('der Lernpfad enthält alle Lerntermine, drei Abrufe mit Feedback und den 48-Stunden-Check', () => {
  const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
  const path = html.split('<article id="lernfahrplan"')[1]?.split('</article>')[0];
  assert.ok(path);
  for (const milestone of ['Tag 1', 'Tag 7', 'Tag 14', 'Tag 30', '48 Stunden']) assert.ok(path.includes(milestone), milestone);
  assert.equal([...path.matchAll(/<details class="retrieval-feedback">/g)].length, 3);
  assert.equal([...path.matchAll(/class="retrieval-answer"/g)].length, 3);
  assert.ok(path.includes('Zwei Erklärfragen') && path.includes('Durchgearbeitetes Beispiel'));
});


test('Lehrpraxis bündelt Beispiele, Lehrenden-Skills und Rollenspiele im Lehrenden-Tab', () => {
  const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
  const teaching = html.split('<section id="lehre"')[1]?.split('</section>')[0];
  assert.ok(teaching?.includes('aria-controls="lehrpanel-praxis"'));
  assert.equal([...teaching.matchAll(/class="faculty-example"/g)].length, 2);
  assert.equal([...teaching.matchAll(/class="faculty-skill"/g)].length, 3);
  assert.equal([...teaching.matchAll(/class="faculty-roleplay"/g)].length, 2);
  assert.equal([...teaching.matchAll(/Beobachtungsbogen und Auswertung/g)].length, 2);
});


test('zwölf Perspektiv-Avatare bieten Grill-me-Fragen und prüfen die fünf Lernprinzipien', () => {
  const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
  const area = html.split('<div id="lehr-grill-me"')[1]?.split('<div class="faculty-grill-end"')[0];
  assert.ok(area);
  const cards = [...area.matchAll(/class="faculty-avatar-card"/g)];
  const prompts = [...area.matchAll(/<textarea id="grill-[^"]+"[^>]*readonly>([\s\S]*?)<\/textarea>/g)];
  assert.equal(cards.length, 12);
  assert.equal(prompts.length, 12);
  assert.equal(new Set(prompts.map(([, prompt]) => prompt)).size, 12);
  for (const [, prompt] of prompts) {
    for (const marker of ['genau eine Frage', 'Tag 7', 'Tag 14', 'Tag 30', '48 Stunden', 'drei Abruffragen', 'zwei vertiefende', 'durchgearbeitetes Beispiel', 'unmittelbar']) {
      assert.ok(prompt.includes(marker), marker);
    }
  }
});

