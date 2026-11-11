import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(([, script]) => script);
const run = context => { for (const script of scripts) runInNewContext(script, context); };
const forms = [...html.matchAll(/<form class="skill-workflow" data-skill="([^"]+)">([\s\S]*?)<\/form>/g)];
const COMPETENCIES = ['Kritisches Denken', 'Evidenzbewertung', 'HR-Entscheidungsqualität', 'KI-Kompetenz', 'Perspektivenwechsel'];

function node(extra = {}) {
  return { hidden: false, textContent: '', listeners: {}, addEventListener(event, handler) { this.listeners[event] = handler; }, ...extra };
}

test('jeder Skill: Prüffrage sichtbar, Prompt erst nach den eigenen Schritten 1 und 2, Rubrik und Transfer', () => {
  assert.equal(forms.length, 20);
  for (const [, slug, body] of forms) {
    assert.match(body, /<p class="workflow-check">Prüffrage · [^<]{10,}<\/p>/, slug);
    const step2 = body.indexOf('name="step-2"');
    const prompt = body.indexOf('<details class="skill-prompt">');
    const step3 = body.indexOf('name="step-3"');
    assert.ok(step2 > 0 && prompt > step2 && prompt < step3, slug + ' Prompt nach Schritt 2');
    assert.ok(body.includes('class="prompt-lock"'), slug);
    const rubric = body.split('<fieldset class="skill-rubric">')[1]?.split('</fieldset>')[0] ?? '';
    assert.equal([...rubric.matchAll(/type="checkbox" name="rubric"/g)].length, 5, slug);
    for (const competency of COMPETENCIES) assert.ok(rubric.includes(competency), slug + ' · ' + competency);
    assert.match(body, /<fieldset class="skill-transfer">[\s\S]*name="transfer-action"[\s\S]*name="transfer-evidence"/, slug);
    assert.ok(body.includes('class="skill-ics"') && body.includes('class="skill-mail"'), slug);
  }
});

test('Human First: der Prompt bleibt gesperrt, bis Schritt 1 und 2 selbst beantwortet sind', () => {
  const step1 = { value: '' }; const step2 = { value: '' };
  const prompt = node(); const lock = node({ hidden: true });
  const workflow = node({
    querySelector: selector => ({ '[name="step-1"]': step1, '[name="step-2"]': step2, '.skill-prompt': prompt, '.prompt-lock': lock })[selector] ?? null,
    querySelectorAll: () => [],
  });
  run({ window: { addEventListener() {} }, location: { hash: '' }, document: { querySelector: () => null, querySelectorAll: s => s === '.skill-workflow' ? [workflow] : [], getElementById: () => null } });
  assert.equal(prompt.hidden, true);
  assert.equal(lock.hidden, false);
  step1.value = 'Wir brauchen mehr Recruiting, weil Stellen offen sind.';
  step2.value = 'kurz';
  workflow.listeners.input();
  assert.equal(prompt.hidden, true);
  step2.value = 'Annahme: Der Bedarf liegt im Volumen, nicht im Prozess.';
  workflow.listeners.input();
  assert.equal(prompt.hidden, false);
  assert.equal(lock.hidden, true);
});

test('Export enthält Selbstbewertung und Transfer, dazu Wiederholungstermine und Gegenrede-Mail', () => {
  const steps = [1, 2].map(i => ({ labels: [{ textContent: i + '. Schritt' }], value: 'Antwort ' + i }));
  const transferAction = { labels: [{ textContent: 'Was setzt du um?' }], value: 'Raster im nächsten Interview testen' };
  const transferEvidence = { labels: [{ textContent: 'Woran merkt wer es?' }], value: 'Recruiting-Leitung sieht begründete Bewertungen' };
  const rubric = [{ value: 'Annahmen gekennzeichnet · Kritisches Denken', checked: true }, { value: 'Quellen belegt · Evidenzbewertung', checked: false }];
  const record = { focus() {} }; const download = {}; const ics = {}; const mail = {};
  const result = { hidden: true, querySelector: s => ({ '.skill-record': record, '.skill-download': download, '.skill-ics': ics, '.skill-mail': mail })[s] };
  const workflow = node({
    querySelector: s => ({ '.skill-result': result, '.workflow-output': { textContent: 'Ergebnis · Evidence Card' }, '.workflow-check': { textContent: 'Prüffrage · Trägt das Design die Wirkung?' }, '[name="transfer-action"]': transferAction, '[name="transfer-evidence"]': transferEvidence })[s] ?? null,
    querySelectorAll: s => s === 'textarea[name]' ? [...steps, transferAction, transferEvidence] : s === 'input[name="rubric"]' ? rubric : [],
  });
  run({ window: { addEventListener() {} }, location: { hash: '' }, document: { querySelector: () => null, querySelectorAll: s => s === '.skill-workflow' ? [workflow] : [], getElementById: () => null } });
  workflow.listeners.submit({ preventDefault() {} });
  assert.equal(result.hidden, false);
  assert.match(record.value, /SELBSTBEWERTUNG[\s\S]*erfüllt: Annahmen gekennzeichnet[\s\S]*offen: Quellen belegt/);
  assert.ok(record.value.includes('Raster im nächsten Interview testen'));
  const calendar = decodeURIComponent(ics.href.split(',')[1]);
  assert.match(ics.href, /^data:text\/calendar;charset=utf-8,/);
  assert.equal([...calendar.matchAll(/BEGIN:VEVENT/g)].length, 4);
  const day = offset => { const d = new Date(); d.setDate(d.getDate() + offset); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); };
  for (const offset of [2, 7, 14, 30]) assert.ok(calendar.includes('DTSTART;VALUE=DATE:' + day(offset)), 'Tag ' + offset);
  const unfolded = calendar.replace(/\r\n /g, '');
  assert.ok(unfolded.includes('Trägt das Design die Wirkung?'));
  assert.ok(unfolded.includes('Raster im nächsten Interview testen'));
  assert.match(unfolded, /48 Stunden|0 bis 100/);
  assert.match(mail.href, /^mailto:\?subject=/);
  assert.ok(decodeURIComponent(mail.href).includes('Welche Gegenposition fehlt?'));
});

test('Methodenwahl: sechs gemischte Fälle, je vier Optionen, sofortiges Feedback mit Fallbezug', () => {
  const block = html.split('<div id="methodenwahl"')[1]?.split('<!-- /methodenwahl -->')[0] ?? '';
  const items = [...block.matchAll(/<fieldset class="choice" data-correct="([\w-]+)" data-correct-label="([^"]+)" data-case="(\d)">([\s\S]*?)<\/fieldset>/g)];
  assert.equal(items.length, 6);
  for (const [, correct, , nr, body] of items) {
    const values = [...body.matchAll(/type="radio" name="wahl-\d" value="([\w-]+)"/g)].map(([, v]) => v);
    assert.equal(values.length, 4);
    assert.ok(values.includes(correct));
    assert.ok(html.includes('id="' + correct + '"'));
    assert.ok(body.includes('href="#fall-' + nr + '"'));
  }
  const radios = [{ value: 'grill-me', checked: false }, { value: 'lerntransfer', checked: true }];
  const feedback = {}; const check = node();
  const fieldset = { dataset: { correct: 'grill-me', correctLabel: 'Annahmen kritisch hinterfragen' }, querySelector: s => ({ '.choice-check': check, '.choice-feedback': feedback })[s], querySelectorAll: () => radios };
  const score = {};
  run({ window: { addEventListener() {} }, location: { hash: '' }, document: { querySelector: () => null, querySelectorAll: s => s === '#methodenwahl .choice' ? [fieldset] : [], getElementById: id => (id === 'methodenwahl-score' ? score : null) } });
  check.listeners.click();
  assert.match(feedback.textContent, /^Nicht ganz/);
  assert.ok(feedback.textContent.includes('Annahmen kritisch hinterfragen'));
  radios[0].checked = true; radios[1].checked = false;
  check.listeners.click();
  assert.match(feedback.textContent, /^Passt/);
  assert.equal(score.textContent, '1 von 1 richtig');
});

test('Perspektiven-Duell erzeugt einen Vergleichsprompt ohne Personen-Imitation und verlangt eine eigene Synthese', () => {
  const duel = html.split('<form id="duell-form"')[1]?.split('</form>')[0] ?? '';
  for (const name of ['a', 'b']) {
    const select = duel.split('<select name="' + name + '"')[1]?.split('</select>')[0] ?? '';
    assert.equal([...select.matchAll(/<option /g)].length, 12, name);
  }
  assert.ok(duel.includes('id="duell-synthese"'));
  const values = { frage: 'Sollen wir Führungskräfte intern entwickeln?', a: 'Dave Ulrich|HR-Wertbeitrag', b: 'Dave Ulrich|HR-Wertbeitrag' };
  const form = node(); const status = {}; const output = {}; const resultBox = { hidden: true };
  run({
    window: { addEventListener() {} }, location: { hash: '' },
    FormData: class { get(key) { return values[key]; } },
    document: { querySelector: () => null, querySelectorAll: () => [], getElementById: id => ({ 'duell-form': form, 'duell-status': status, 'duell-prompt': output, 'duell-result': resultBox })[id] ?? null },
  });
  form.listeners.submit({ preventDefault() {} });
  assert.match(status.textContent, /zwei unterschiedliche/);
  assert.equal(resultBox.hidden, true);
  values.b = 'John Boudreau|Talententscheidungen und Workforce-Strategie';
  form.listeners.submit({ preventDefault() {} });
  assert.equal(resultBox.hidden, false);
  for (const part of ['Dave Ulrich', 'John Boudreau', values.frage, 'Imitiere keine Person', 'erfinde keine Zitate', 'Synthese schreibe ich selbst']) assert.ok(output.value.includes(part), part);
});
