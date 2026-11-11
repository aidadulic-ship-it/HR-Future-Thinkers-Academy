import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
function logic() {
  const context = { window: { addEventListener() {}, matchMedia: () => ({ matches: true }) }, document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} }, requestAnimationFrame() {}, setInterval() {}, clearInterval() {} };
  runInNewContext(html.match(/<script data-part="spiel">([\s\S]*?)<\/script>/)[1], context);
  return context;
}

test('das Spiel ist eine eigenständige Datei ohne externe Abrufe, mit Schriften und Marke', () => {
  assert.doesNotMatch(html, /<script[^>]+src=|<link[^>]+stylesheet|fonts\.googleapis/);
  assert.match(html, /<html lang="de-AT">/);
  assert.match(html, /src: url\("data:font\/woff2;base64,/);
  for (const color of ['#12295a', '#d6288c', '#b0116f']) assert.ok(html.includes(color), color);
  assert.match(html, /Werde <em>HR-Mastermind\.<\/em>/);
  assert.doesNotMatch(html, /HR-Genius|HR-GENIUS|HR Genius/i);
  assert.doesNotMatch(readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8'), /HR-Genius/i);
  assert.doesNotMatch(html, /HR AI Genius|HR AI GENIUS|HR-AI-Genius/i);
  assert.match(html, /Spielauszeichnung[^<]*kein Kompetenznachweis/);
});

test('fünf Level mit je einem Fall zum Finden, fünf Fragen und einem Prompt-Joker aus der Academy', () => {
  const { LEVELS, PROMPTS } = logic();
  assert.equal(LEVELS.length, 5);
  for (const level of LEVELS) {
    assert.equal(level.cases.length, 4, level.title);
    assert.equal(level.cases.filter(c => c.correct).length, 1, level.title);
    assert.ok(level.questions.length >= 8, level.title);
    for (const q of level.questions) {
      assert.equal(q.options.length, 4, q.text);
      assert.ok(q.correct >= 0 && q.correct < 4, q.text);
      assert.ok(q.explain.length > 30, q.text);
    }
    const prompt = PROMPTS[level.skill];
    assert.ok(prompt && prompt.includes('[Fall oder Kontext]'), level.skill);
  }
});

test('Punkte: Serie und Tempo bringen mehr, der Joker halbiert, Fehler bringen nichts', () => {
  const { scoreAnswer } = logic();
  assert.equal(scoreAnswer({ correct: true, streak: 0, seconds: 30, joker: false }), 100);
  assert.equal(scoreAnswer({ correct: true, streak: 2, seconds: 30, joker: false }), 150);
  assert.equal(scoreAnswer({ correct: true, streak: 9, seconds: 10, joker: false }), 225);
  assert.equal(scoreAnswer({ correct: true, streak: 2, seconds: 10, joker: true }), 87);
  assert.equal(scoreAnswer({ correct: false, streak: 3, seconds: 5, joker: false }), 0);
});

test('wer gut spielt, ist schneller im nächsten Level; Fehler kommen wieder', () => {
  const { createLevelRun, answerQuestion } = logic();
  const perfect = createLevelRun(5);
  let steps = 0;
  while (!perfect.done) { answerQuestion(perfect, { correct: true, seconds: 10, joker: false }); steps++; }
  assert.equal(steps, 2);
  assert.equal(perfect.stars, 3);
  const shaky = createLevelRun(5);
  const answers = [false, true, false, true, true, true, true, true];
  let i = 0;
  while (!shaky.done) answerQuestion(shaky, { correct: answers[i++], seconds: 30, joker: false });
  assert.ok(i > 3);
  assert.ok(shaky.stars < 3);
  assert.ok(shaky.asked.filter(index => index === shaky.asked[0]).length >= 2, 'falsch beantwortete Frage kommt erneut');
});

test('Joker zeigt den Prompt und streicht zwei falsche Antworten, pro Level zwei Joker', () => {
  const { useJoker, createLevelRun } = logic();
  const run = createLevelRun(5);
  const question = { options: ['a', 'b', 'c', 'd'], correct: 2 };
  const first = useJoker(run, question);
  assert.equal(first.removed.length, 2);
  assert.ok(!first.removed.includes(2));
  useJoker(run, question);
  assert.equal(useJoker(run, question), null);
  assert.equal(run.jokers, 0);
});

test('der Joker funktioniert ohne KI-Konto: eingebauter Tipp, Prompt nur optional', () => {
  const { LEVELS } = logic();
  for (const level of LEVELS) for (const q of level.questions) {
    assert.ok(q.hint && q.hint.length >= 25, q.text);
    assert.ok(!q.hint.includes(q.options[q.correct]), 'Tipp verrät die Antwort: ' + q.text);
  }
  const dialog = html.split('<dialog')[1]?.split('</dialog>')[0] ?? '';
  assert.match(dialog, /id="joker-hint"/);
  assert.match(dialog, /<details class="joker-prompt-box"><summary>[^<]*optional[^<]*<\/summary>[\s\S]*id="joker-prompt"/);
  assert.match(html, /ohne KI-Konto/);
  assert.doesNotMatch(dialog, /Kopiere den Prompt in dein KI-Tool\./);
});

test('der Joker hilft ohne KI-Konto: Denkhilfe im Spiel, Prompt nur optional', () => {
  const { LEVELS, useJoker, createLevelRun } = logic();
  for (const level of LEVELS) for (const q of level.questions) assert.ok(q.hint && q.hint.length >= 25, q.text);
  const run = createLevelRun(5);
  const result = useJoker(run, { options: ['a', 'b', 'c', 'd'], correct: 0, hint: 'Rechne zuerst den Anteil aus.', joker: 'grill-me' });
  assert.equal(result.hint, 'Rechne zuerst den Anteil aus.');
  const dialog = html.split('<dialog')[1]?.split('</dialog>')[0] ?? '';
  assert.match(dialog, /id="joker-hint"/);
  assert.match(dialog, /<details[^>]*><summary>[^<]*optional[^<]*<\/summary>[\s\S]*id="joker-prompt"/i);
  assert.doesNotMatch(dialog, /<details[^>]* open/);
  assert.match(html, /Ohne Anmeldung, ohne KI-Konto/);
});


const academy = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');

test('Missionen verraten die Akte nicht, Akten liefern Daten, jede Frage führt in die Academy', () => {
  const { LEVELS } = logic();
  for (const level of LEVELS) {
    const correct = level.cases.find(c => c.correct);
    for (const word of correct.title.split(/[\s-]+/).filter(w => w.length >= 5)) assert.ok(!level.mission.toLowerCase().includes(word.toLowerCase()), level.title + ': ' + word);
    for (const c of level.cases) assert.match(c.teaser, /\d/, c.title);
    assert.ok(level.facts.length >= 3, level.title);
    for (const q of level.questions) {
      assert.ok(q.hint && q.explain, q.text);
      const skill = q.skill ?? level.skill;
      assert.ok(academy.includes('<summary id="' + skill + '">'), skill);
    }
  }
});

test('Fragen und Antworten werden gemischt, die richtige Antwort wandert mit', () => {
  const { shuffleQuestion, createLevelRun } = logic();
  let seed = 1; const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const q = { options: ['richtig', 'b', 'c', 'd'], correct: 0 };
  const shuffled = shuffleQuestion(q, rng);
  assert.equal(shuffled.options[shuffled.correct], 'richtig');
  assert.deepEqual([...shuffled.options].sort(), ['b', 'c', 'd', 'richtig']);
  const orders = new Set(Array.from({ length: 6 }, () => createLevelRun(8, rng).queue.join(',')));
  assert.ok(orders.size > 1);
});

test('Schlussrunde: je eine Frage aus allen fünf Leveln, bestanden ab vier Richtigen', () => {
  const { createFinalRound, LEVELS, finalPassed } = logic();
  const round = createFinalRound(LEVELS, Math.random);
  assert.equal(round.items.length, 5);
  assert.equal(round.items.map(item => item.level).join(','), '0,1,2,3,4');
  assert.equal(finalPassed({ correct: 4, total: 5 }), true);
  assert.equal(finalPassed({ correct: 3, total: 5 }), false);
});

test('ruhige, klare Oberfläche: Zeitdruck abschaltbar, Tastatur, keine Werbebegriffe', () => {
  assert.match(html, /<input type="checkbox" id="no-timer">[^<]*Ohne Zeitdruck spielen/);
  assert.match(html, /Tasten 1 bis 4/);
  assert.doesNotMatch(html.replace(/data:[^"')]+/g, ''), /masterclass|high[\s-]?end|executive[\s-]?level|premium/i);
});

test('Fragen sind ohne Fachjargon verständlich und gleich aufgebaut', () => {
  const { LEVELS } = logic();
  const jargon = /Keep Human|Augment|Automate|Pilot|Median|Indikator|Transfer|XP/;
  for (const level of LEVELS) {
    assert.doesNotMatch(level.mission, jargon, level.mission);
    for (const q of level.questions) {
      assert.ok(q.text.endsWith('?'), q.text);
      assert.ok(q.text.length <= 170, q.text);
      assert.doesNotMatch(q.text, jargon, q.text);
      for (const option of q.options) assert.doesNotMatch(option, jargon, option);
      assert.ok(!q.hint.includes(q.options[q.correct]), q.text);
    }
  }
});

test('der Spieltitel bricht nicht am Bindestrich um', () => {
  const css = readFileSync(new URL('./spiel.css', import.meta.url), 'utf8');
  assert.match(css, /#spiel h1 em, #spiel h2 em \{[^}]*white-space: nowrap/);
});
