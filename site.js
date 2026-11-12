const form = document.querySelector('#brief-form');
const output = document.querySelector('#brief-output');
const brief = document.querySelector('#brief-text');

const sections = [
  ['option', 'EMPFEHLUNG UND ALTERNATIVE'],
  ['evidence', 'EVIDENZ UND UNSICHERHEIT'],
  ['guardrail', 'PILOTGRENZE UND STOPPKRITERIUM'],
  ['review', 'VERANTWORTUNG UND REVIEW'],
];

form?.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const paragraphs = sections.map(([key, title]) => title + '\n' + data.get(key).trim());
  brief.value = ['EXECUTIVE BRIEFING · KI IM RECRUITING', ...paragraphs].join('\n\n');
  output.hidden = false;
  brief.focus();
});


const COUNTER_QUESTIONS = [
  'Welche Annahme in meinem Protokoll ist am schwächsten belegt?',
  'Welche Gegenposition fehlt?',
  'Welche Evidenz würde meine Entscheidung umkehren?',
  'Wer ist betroffen und wurde nicht gehört?',
  'Ist mein Transferkriterium beobachtbar, und wer würde es prüfen?',
];

function icsText(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function icsFold(line) {
  const parts = [];
  let current = '';
  let bytes = 0;
  for (const char of line) {
    const size = unescape(encodeURIComponent(char)).length;
    if (bytes + size > 73) { parts.push(current); current = ''; bytes = 0; }
    current += char;
    bytes += size;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

function icsDate(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.getFullYear() + String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0');
}

function buildReviewCalendar(skill, check, action, evidence) {
  const events = [
    [2, '48-Stunden-Check', 'Schätze zuerst ein, wie sicher du bist (0 bis 100 %), die sechs Schritte von „' + skill + '“ ohne Vorlage zu nennen. Schreibe sie dann aus dem Gedächtnis auf, vergleiche mit deinem Protokoll und wiederhole den schwächsten Schritt.'],
    [7, 'Abruf ohne Vorlage', 'Beantworte ohne Protokoll und ohne KI: ' + check + ' Vergleiche danach mit deinem Protokoll und korrigiere, was fehlt.'],
    [14, 'Übertragen auf einen neuen Fall', 'Wähle eine andere Fallstudie der Academy. Welche Regel aus „' + skill + '“ gilt dort weiter, was muss sich ändern? Begründe in drei Sätzen.'],
    [30, 'Transfer-Review', 'Dein Vorhaben: ' + (action || 'offen') + ' Woran es erkennbar sein sollte: ' + (evidence || 'offen') + ' Entscheide: fortsetzen, anpassen oder stoppen.'],
  ];
  return icsCalendar(events.map(([offset, title, text]) => ({
    date: icsDate(offset),
    summary: 'Tag ' + offset + ' · ' + title + ' · ' + skill,
    description: text,
  })));
}

function icsCalendar(events) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const next = date => { const d = new Date(+date.slice(0, 4), +date.slice(4, 6) - 1, +date.slice(6, 8) + 1); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); };
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//HR Future Thinkers Academy//Lernen//DE', 'CALSCALE:GREGORIAN'];
  events.forEach(({ date, summary, description }, index) => {
    lines.push('BEGIN:VEVENT', 'UID:' + stamp + '-' + index + '@academy.local', 'DTSTAMP:' + stamp,
      'DTSTART;VALUE=DATE:' + date, 'DTEND;VALUE=DATE:' + next(date),
      icsFold('SUMMARY:' + icsText(summary)), icsFold('DESCRIPTION:' + icsText(description)), 'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

for (const workflow of document.querySelectorAll('.skill-workflow')) {
  const prompt = workflow.querySelector('.skill-prompt');
  const lock = workflow.querySelector('.prompt-lock');
  const ownSteps = ['[name="step-1"]', '[name="step-2"]'].map(selector => workflow.querySelector(selector));
  const updateLock = () => {
    if (!prompt || !lock) return;
    const done = ownSteps.every(field => (field?.value ?? '').trim().length >= 20);
    prompt.hidden = !done;
    lock.hidden = done;
  };
  const modelAnswers = Array.from(workflow.querySelectorAll('.model-answer'), answer => ({
    answer,
    field: workflow.querySelector('[name="step-' + answer.dataset.step + '"]'),
  }));
  const updateModelAnswers = () => {
    for (const { answer, field } of modelAnswers) {
      const ready = (field?.value ?? '').trim().length >= 20;
      if (!ready) answer.open = false;
      answer.hidden = !ready;
    }
  };
  workflow.addEventListener('input', () => { updateLock(); updateModelAnswers(); });
  updateLock();
  updateModelAnswers();

  workflow.addEventListener('submit', event => {
    event.preventDefault();
    const result = workflow.querySelector('.skill-result');
    const record = result.querySelector('.skill-record');
    const title = workflow.querySelector('.workflow-output').textContent;
    const check = (workflow.querySelector('.workflow-check')?.textContent ?? '').replace(/^Prüffrage · /, '');
    const skill = workflow.closest?.('details')?.querySelector('.card-title')?.textContent ?? title.replace(/^Ergebnis · /, '');
    const steps = Array.from(workflow.querySelectorAll('textarea[name]'), field =>
      field.labels[0].textContent.trim() + '\n' + field.value.trim()
    );
    const rubric = Array.from(workflow.querySelectorAll('input[name="rubric"]'), box => (box.checked ? 'erfüllt: ' : 'offen: ') + box.value);
    const parts = [title, ...steps];
    if (rubric.length) parts.push('SELBSTBEWERTUNG\n' + rubric.join('\n'));
    record.value = parts.join('\n\n');
    result.querySelector('.skill-download').href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(record.value);
    const action = workflow.querySelector('[name="transfer-action"]')?.value?.trim() ?? '';
    const evidence = workflow.querySelector('[name="transfer-evidence"]')?.value?.trim() ?? '';
    const ics = result.querySelector('.skill-ics');
    if (ics) ics.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(buildReviewCalendar(skill, check, action, evidence));
    const mail = result.querySelector('.skill-mail');
    if (mail) {
      const body = 'Ich bitte dich um Gegenrede zu meinem Arbeitsprotokoll. Bitte beantworte kurz:\n\n'
        + COUNTER_QUESTIONS.map((question, index) => (index + 1) + '. ' + question).join('\n')
        + '\n\n--- Protokoll ---\n' + record.value.slice(0, 1500);
      mail.href = 'mailto:?subject=' + encodeURIComponent('Gegenrede erbeten: ' + skill) + '&body=' + encodeURIComponent(body);
    }
    result.hidden = false;
    record.focus();
  });
}

const answeredChoices = new Set();
for (const choice of document.querySelectorAll('#methodenwahl .choice')) {
  const button = choice.querySelector('.choice-check');
  const feedback = choice.querySelector('.choice-feedback');
  button.addEventListener('click', () => {
    const picked = Array.from(choice.querySelectorAll('input[type="radio"]')).find(radio => radio.checked);
    if (!picked) { feedback.textContent = 'Wähle zuerst einen Skill.'; return; }
    const correct = picked.value === choice.dataset.correct;
    feedback.textContent = correct
      ? 'Passt. „' + choice.dataset.correctLabel + '“ ist die Methode, die die Fallstudie zuerst empfiehlt. Prüfe in der Fallstudie, welche Skills zusätzlich helfen.'
      : 'Nicht ganz. Die Fallstudie empfiehlt zuerst „' + choice.dataset.correctLabel + '“. Welche Angabe im Fall spricht dafür?';
    choice.lastCorrect = correct;
    answeredChoices.add(choice);
    const all = Array.from(answeredChoices);
    const right = all.filter(item => item.lastCorrect).length;
    const score = document.getElementById('methodenwahl-score');
    if (score) score.textContent = right + ' von ' + all.length + ' richtig';
  });
}

const duelForm = document.getElementById('duell-form');
if (duelForm) {
  duelForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(duelForm);
    const question = String(data.get('frage') ?? '').trim();
    const [nameA, topicA] = String(data.get('a')).split('|');
    const [nameB, topicB] = String(data.get('b')).split('|');
    const status = document.getElementById('duell-status');
    const result = document.getElementById('duell-result');
    if (nameA === nameB) {
      status.textContent = 'Wähle zwei unterschiedliche Perspektiven.';
      result.hidden = true;
      return;
    }
    status.textContent = '';
    document.getElementById('duell-prompt').value = [
      'Analysiere meine HR-Frage aus zwei fachlichen Perspektiven: „' + topicA + '“, angelehnt an das Academy-Profil von ' + nameA + ', und „' + topicB + '“, angelehnt an das Academy-Profil von ' + nameB + '.',
      'Imitiere keine Person, erfinde keine Zitate und schreibe niemandem Aussagen zu. Kennzeichne nicht verifizierte Aussagen.',
      'Meine Frage: ' + question,
      'Gehe für jede Perspektive so vor: 1. Kernannahme. 2. Was diese Perspektive an meiner Frage betonen würde. 3. Was sie übersehen könnte. 4. Welche Evidenz sie für eine Entscheidung verlangen würde.',
      'Stelle danach die Widersprüche zwischen beiden Perspektiven gegenüber und nenne eine Frage, die ich vor einer Entscheidung klären muss.',
      'Gib keine Empfehlung. Die Synthese schreibe ich selbst. Verwende nur synthetische oder tatsächlich anonymisierte Angaben.',
    ].join('\n\n');
    result.hidden = false;
  });
}


function normalizeSkillSearch(value) {
  return value.toLocaleLowerCase('de').normalize('NFKD').replace(/\p{M}/gu, '').replace(/ß/g, 'ss');
}

const skillSearch = document.getElementById('skill-search');
const skillChips = Array.from(document.querySelectorAll('#skill-filter [data-filter]'));
let skillVerb = 'alle';
let resetSkillFilters = () => {};
if (skillSearch) {
  const status = document.getElementById('skill-search-status');
  const skills = Array.from(document.querySelectorAll('#skills .tools > details'), element => ({
    element,
    text: normalizeSkillSearch(element.textContent.replace(/\s+/g, ' ')),
  }));
  const filterSkills = () => {
    const terms = normalizeSkillSearch(skillSearch.value).trim().split(/\s+/).filter(Boolean);
    let matches = 0;
    for (const { element, text } of skills) {
      const verbMatches = skillVerb === 'alle' || element.dataset?.verb === skillVerb;
      element.hidden = !(verbMatches && terms.every(term => text.includes(term)));
      if (!element.hidden) matches++;
    }
    status.textContent = matches ? matches + ' von ' + skills.length + ' Skills' : 'Keine Skills gefunden. Probiere einen anderen Suchbegriff oder eine andere Tätigkeit.';
  };
  const selectVerb = verb => {
    skillVerb = verb;
    for (const chip of skillChips) chip.setAttribute('aria-pressed', String(chip.dataset.filter === verb));
    filterSkills();
  };
  for (const chip of skillChips) chip.addEventListener('click', () => selectVerb(chip.dataset.filter));
  resetSkillFilters = () => {
    skillSearch.value = '';
    selectVerb('alle');
  };
  skillSearch.addEventListener('input', filterSkills);
  filterSkills();
}

// Öffnet das Ziel eines internen Links (z. B. eine Karte). Funktioniert per Hash und per Klick,
// damit es auch in Vorschauen ohne Hash-Ereignisse zuverlässig bleibt.
function openLinkedLesson(id = location.hash.slice(1)) {
  const target = id ? document.getElementById(id) : null;
  const wasHidden = target?.closest('[hidden]');
  const lesson = target?.closest('details');
  if (lesson?.hidden) resetSkillFilters();
  const wasClosed = Boolean(lesson && !lesson.open);
  if (lesson) lesson.open = true;
  return Boolean(wasHidden || wasClosed);
}



const workbenchForm = document.getElementById('workbench-form');
if (workbenchForm) {
  workbenchForm.addEventListener('submit', event => {
    event.preventDefault();
    let lastStep = '';
    const fields = Array.from(workbenchForm.querySelectorAll('[name]'), field => {
      const label = field.labels[0].firstChild.textContent.trim();
      const step = field.closest?.('fieldset')?.querySelector('legend')?.textContent.trim() ?? '';
      const heading = step && step !== lastStep ? step.toUpperCase() + '\n\n' : '';
      lastStep = step || lastStep;
      return heading + label + '\n' + (field.value.trim() || 'Offen');
    });
    const record = document.getElementById('workbench-record');
    record.value = ['REALITY CHECK · WORKSHOP-PROTOKOLL', ...fields].join('\n\n');
    document.getElementById('workbench-download').href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(record.value);
    document.getElementById('workbench-result').hidden = false;
    record.focus();
  });
}

const teacherTabList = document.getElementById('lehrvorschau-tabs');
if (teacherTabList) {
  const tabs = Array.from(teacherTabList.querySelectorAll('[role="tab"]'));
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));

  function selectTeacherTab(index) {
    tabs.forEach((tab, position) => {
      const selected = position === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[position].hidden = !selected;
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTeacherTab(index));
    tab.addEventListener('keydown', event => {
      const last = tabs.length - 1;
      const targets = {
        ArrowLeft: index === 0 ? last : index - 1,
        ArrowRight: index === last ? 0 : index + 1,
        ArrowUp: index === 0 ? last : index - 1,
        ArrowDown: index === last ? 0 : index + 1,
        Home: 0,
        End: last,
      };
      if (!Object.hasOwn(targets, event.key)) return;
      event.preventDefault();
      const next = targets[event.key];
      selectTeacherTab(next);
      tabs[next].focus();
    });
  });
  function showGrillFromLink() {
    if (location.hash !== '#lehr-grill-me') return;
    const index = panels.indexOf(document.getElementById('lehrpanel-grill'));
    if (index < 0) return;
    selectTeacherTab(index);
    document.getElementById('lehr-grill-me')?.scrollIntoView();
  }

  selectTeacherTab(0);
  showGrillFromLink();
  window.addEventListener('hashchange', showGrillFromLink);
  document.getElementById('grill-einstieg')?.addEventListener('click', showGrillFromLink);
}








/* Entscheidungs-Zeitkapsel: alles lokal, keine Speicherung */
const CAPSULE_TYPE = 'hrfta-zeitkapsel';
const CAPSULE_FIELDS = ['entscheidung', 'vorhersage', 'kriterium', 'thema'];

function isoDay(date) {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

function buildCapsule(data, now = new Date()) {
  const due = new Date(now.getFullYear(), now.getMonth(), now.getDate() + Number(data.frist));
  const capsule = { id: now.getTime().toString(36) + '-' + Math.random().toString(36).slice(2, 8), erstellt: isoDay(now), faellig: isoDay(due), sicherheit: Number(data.sicherheit), ergebnis: null, notiz: '' };
  for (const field of CAPSULE_FIELDS) capsule[field] = String(data[field] ?? '').trim().slice(0, 600);
  return capsule;
}

function capsuleFileText(capsules) {
  return JSON.stringify({ type: CAPSULE_TYPE, version: 1, capsules }, null, 2);
}

function parseCapsuleFile(text) {
  if (String(text).length > 1_000_000) throw new Error('Datei zu groß');
  const data = JSON.parse(text);
  if (!data || data.type !== CAPSULE_TYPE || !Array.isArray(data.capsules)) throw new Error('Keine Zeitkapsel-Datei');
  return data.capsules.map(item => {
    const sicherheit = Number(item?.sicherheit);
    if (typeof item?.id !== 'string' || !(sicherheit >= 50 && sicherheit <= 100)) throw new Error('Ungültige Kapsel');
    const capsule = { id: item.id.slice(0, 60), sicherheit, erstellt: String(item.erstellt ?? '').slice(0, 10), faellig: String(item.faellig ?? '').slice(0, 10), ergebnis: ['ja', 'nein', 'unklar'].includes(item.ergebnis) ? item.ergebnis : null, notiz: String(item.notiz ?? '').slice(0, 600) };
    for (const field of CAPSULE_FIELDS) capsule[field] = String(item[field] ?? '').slice(0, 600);
    return capsule;
  });
}

function mergeCapsules(current, incoming) {
  const byId = new Map(current.map(capsule => [capsule.id, capsule]));
  for (const capsule of incoming) {
    const known = byId.get(capsule.id);
    byId.set(capsule.id, known && !capsule.ergebnis ? { ...capsule, ergebnis: known.ergebnis, notiz: known.notiz } : capsule);
  }
  return [...byId.values()];
}

function calibrationProfile(capsules) {
  const resolved = capsules.filter(capsule => capsule.ergebnis === 'ja' || capsule.ergebnis === 'nein');
  const rate = list => Math.round(100 * list.filter(capsule => capsule.ergebnis === 'ja').length / list.length);
  const levels = [...new Set(resolved.map(capsule => capsule.sicherheit))].sort((a, b) => a - b).map(sicherheit => {
    const list = resolved.filter(capsule => capsule.sicherheit === sicherheit);
    const treffer = rate(list);
    const diff = treffer - sicherheit;
    const einschaetzung = list.length < 3 ? 'noch zu wenige Fälle' : diff <= -15 ? 'du überschätzt dich' : diff >= 15 ? 'du unterschätzt dich' : 'passend kalibriert';
    return { sicherheit, anzahl: list.length, treffer, einschaetzung };
  });
  const themen = [...new Set(resolved.map(capsule => capsule.thema))].sort((a, b) => a.localeCompare(b, 'de')).map(thema => {
    const list = resolved.filter(capsule => capsule.thema === thema);
    return { thema, anzahl: list.length, treffer: rate(list) };
  });
  const brier = resolved.length ? resolved.reduce((sum, capsule) => sum + ((capsule.sicherheit / 100) - (capsule.ergebnis === 'ja' ? 1 : 0)) ** 2, 0) / resolved.length : null;
  const hinweis = resolved.length < 10
    ? 'Noch zu wenige ausgewertete Kapseln für ein belastbares Profil (' + resolved.length + ' von mindestens 10). Lies die Werte als erste Hinweise.'
    : 'Profil aus ' + resolved.length + ' ausgewerteten Kapseln. Ein Brier-Wert nahe 0 ist gut, 0,25 entspricht reinem Raten mit 50 %.';
  return { resolved: resolved.length, open: capsules.filter(capsule => !capsule.ergebnis).length, unclear: capsules.filter(capsule => capsule.ergebnis === 'unklar').length, levels, themen, brier, hinweis };
}

function capsuleElement(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}

const capsuleForm = document.getElementById('kapsel-form');
if (capsuleForm) {
  capsuleForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(capsuleForm);
    const capsule = buildCapsule(Object.fromEntries(['entscheidung', 'vorhersage', 'kriterium', 'sicherheit', 'frist', 'thema'].map(key => [key, data.get(key)])));
    const date = capsule.faellig.replace(/-/g, '');
    document.getElementById('kapsel-download').href = 'data:application/json;charset=utf-8,' + encodeURIComponent(capsuleFileText([capsule]));
    document.getElementById('kapsel-download').download = 'zeitkapsel-' + capsule.erstellt + '.json';
    document.getElementById('kapsel-termin').href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsCalendar([{
      date, summary: 'Zeitkapsel öffnen · ' + capsule.vorhersage.slice(0, 60),
      description: 'Öffne deine Kapsel-Datei in der HR Future Thinkers Academy (Bereich Zeitkapsel). Vorhersage: ' + capsule.vorhersage + ' Messkriterium: ' + capsule.kriterium + ' Deine Sicherheit: ' + capsule.sicherheit + ' %.',
    }]));
    document.getElementById('kapsel-termin').download = 'zeitkapsel-termin-' + capsule.faellig + '.ics';
    document.getElementById('kapsel-zusammenfassung').textContent = 'Kapsel erstellt. Prüftermin: ' + capsule.faellig.split('-').reverse().join('.') + '. Speichere die Datei, sonst ist die Kapsel beim Neuladen weg.';
    document.getElementById('kapsel-ergebnis').hidden = false;
  });
}

const capsuleInput = document.getElementById('kapsel-datei');
if (capsuleInput) {
  let capsules = [];
  const list = document.getElementById('kapsel-liste');
  const status = document.getElementById('kapsel-status');
  const profileBox = document.getElementById('kapsel-profil');
  const collection = document.getElementById('kapsel-sammlung');
  const today = isoDay(new Date());

  const renderProfile = () => {
    const profile = calibrationProfile(capsules);
    profileBox.replaceChildren();
    if (!profile.resolved) { profileBox.append(capsuleElement('p', 'Trage bei fälligen Kapseln ein, was eingetreten ist. Dann entsteht hier dein Urteilsprofil.', 'field-note')); }
    else {
      profileBox.append(capsuleElement('h4', 'Dein Urteilsprofil'), capsuleElement('p', profile.hinweis, 'field-note'));
      const table = capsuleElement('table', undefined, 'capsule-table');
      const head = capsuleElement('tr');
      for (const label of ['Deine Sicherheit', 'Kapseln', 'Tatsächlich eingetreten', 'Einschätzung']) head.append(capsuleElement('th', label));
      table.append(head);
      for (const level of profile.levels) {
        const row = capsuleElement('tr');
        for (const value of [level.sicherheit + ' %', String(level.anzahl), level.treffer + ' %', level.einschaetzung]) row.append(capsuleElement('td', value));
        table.append(row);
      }
      profileBox.append(table);
      if (profile.themen.length > 1) profileBox.append(capsuleElement('p', 'Nach Thema: ' + profile.themen.map(t => t.thema + ' ' + t.treffer + ' % eingetreten (' + t.anzahl + ')').join(' · ')));
      profileBox.append(capsuleElement('p', 'Brier-Wert: ' + profile.brier.toFixed(2).replace('.', ',') + ' · offen: ' + profile.open + ' · unklar: ' + profile.unclear));
    }
    collection.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(capsuleFileText(capsules));
    collection.download = 'zeitkapseln-' + today + '.json';
    collection.hidden = !capsules.length;
  };

  const renderList = () => {
    list.replaceChildren();
    const ordered = [...capsules].sort((a, b) => (a.ergebnis ? 1 : 0) - (b.ergebnis ? 1 : 0) || a.faellig.localeCompare(b.faellig));
    for (const capsule of ordered) {
      const card = capsuleElement('fieldset', undefined, 'capsule-item');
      const due = capsule.faellig <= today;
      card.append(capsuleElement('legend', (due ? 'Fällig seit ' : 'Fällig am ') + capsule.faellig.split('-').reverse().join('.') + ' · ' + capsule.thema));
      card.append(capsuleElement('p', 'Vorhersage: ' + capsule.vorhersage), capsuleElement('p', 'Messkriterium: ' + capsule.kriterium + ' · Sicherheit ' + capsule.sicherheit + ' %', 'field-note'));
      if (!due && !capsule.ergebnis) card.append(capsuleElement('p', 'Noch nicht fällig. Du kannst das Ergebnis trotzdem eintragen.', 'field-note'));
      const choices = capsuleElement('div', undefined, 'capsule-choices');
      for (const [value, label] of [['ja', 'Eingetreten'], ['nein', 'Nicht eingetreten'], ['unklar', 'Unklar']]) {
        const option = capsuleElement('label');
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'ergebnis-' + capsule.id;
        radio.value = value;
        radio.checked = capsule.ergebnis === value;
        radio.addEventListener('change', () => { capsule.ergebnis = value; renderProfile(); });
        option.append(radio, ' ' + label);
        choices.append(option);
      }
      card.append(choices);
      list.append(card);
    }
  };

  capsuleInput.addEventListener('change', async () => {
    const messages = [];
    for (const file of capsuleInput.files) {
      try { capsules = mergeCapsules(capsules, parseCapsuleFile(await file.text())); }
      catch { messages.push(file.name + ' ist keine gültige Zeitkapsel-Datei.'); }
    }
    status.textContent = (capsules.length ? capsules.length + ' Kapseln geladen. ' : '') + messages.join(' ');
    renderList();
    renderProfile();
  });
}


/* Prompts kopieren und als Textdatei speichern */
for (const box of document.querySelectorAll('.prompt-actions')) {
  const copy = box.querySelector('.prompt-copy');
  const download = box.querySelector('.prompt-download');
  const status = box.querySelector('.prompt-status');
  const source = () => document.getElementById(copy?.dataset.target ?? download?.dataset.target);
  download?.addEventListener('click', () => {
    download.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(source()?.value ?? '');
  });
  copy?.addEventListener('click', async () => {
    const area = source();
    const text = area?.value ?? '';
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'Prompt kopiert. Füge ihn in dein KI-Tool ein.';
    } catch {
      area?.select?.();
      status.textContent = 'Kopieren nicht möglich. Der Prompt ist markiert, kopiere ihn mit Strg+C.';
    }
  });
}

/* Alle Prompts der Bibliothek als eine Datei */
const libraryAll = document.getElementById('bib-alle');
libraryAll?.addEventListener('click', () => {
  const parts = Array.from(document.querySelectorAll('#prompts textarea[id^="bib-"]'), (area, index) =>
    (index + 1) + '. ' + area.dataset.title + '\n' + '='.repeat(40) + '\n' + area.value.trim());
  const text = ['HR FUTURE THINKERS ACADEMY · 20 SKILL-PROMPTS', 'Ersetze die Angaben in eckigen Klammern. Verwende nur synthetische oder tatsächlich anonymisierte Daten.', ...parts].join('\n\n');
  libraryAll.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
});


// Karten öffnen und schließen, ohne dass die Seite springt:
// Die angeklickte Karte bleibt unter dem Mauszeiger, eine zuvor offene Karte im selben Raster schließt sich.
let cardAnchor = null;
document.addEventListener?.('click', event => {
  const summary = event.target?.closest?.('.card-grid > details > summary');
  if (summary) cardAnchor = { summary, top: summary.getBoundingClientRect().top };
}, true);
for (const card of document.querySelectorAll('.card-grid > details')) {
  card.addEventListener('toggle', () => {
    if (card.open) {
      for (const other of card.parentElement.querySelectorAll(':scope > details[open]')) if (other !== card) other.open = false;
    }
    if (cardAnchor && cardAnchor.summary.parentElement === card) {
      const shift = cardAnchor.summary.getBoundingClientRect().top - cardAnchor.top;
      if (Math.abs(shift) > 1) window.scrollBy?.({ top: shift, behavior: 'instant' });
      cardAnchor = null;
    }
  });
}

// Seitenleiste und Hauptfenster: Jedes Thema ist eine eigene Ansicht.
// Klick in der Leiste zeigt nur dieses Thema, Zurück führt zur vorherigen Ansicht, Home zur Startseite.
// Ohne Skript bleibt die ganze Seite lesbar (die Klasse js-views blendet erst dann aus).
const viewRoot = document.getElementById('inhalt');
const viewStack = [];
let currentView = null;

function viewOf(id) {
  if (!id || id === 'inhalt') return 'home';
  return document.getElementById(id)?.closest?.('#inhalt > [data-view]')?.dataset.view ?? null;
}

function sideLinkFor(view) {
  return Array.from(document.querySelectorAll('.sidebar a[href^="#"]')).find(link => viewOf(link.getAttribute('href').slice(1)) === view && !link.classList?.contains('brand'));
}

function groupOf(link) {
  let node = link?.previousElementSibling;
  while (node && !node.classList?.contains('side-group')) node = node.previousElementSibling;
  return node?.textContent?.trim() ?? link?.closest?.('.side-more')?.querySelector('summary')?.textContent?.trim() ?? '';
}

function showView(view) {
  currentView = view;
  for (const section of document.querySelectorAll('#inhalt > [data-view]')) section.classList.toggle('is-active', section.dataset.view === view);
  let label = 'Startseite';
  let group = '';
  for (const link of document.querySelectorAll('.sidebar a[href^="#"]')) {
    const match = viewOf(link.getAttribute('href').slice(1)) === view && !link.classList?.contains('brand');
    if (match) {
      link.setAttribute('aria-current', 'page');
      label = link.textContent?.trim() || view;
      group = groupOf(link);
      const more = link.closest?.('.side-more');
      if (more) more.open = true;
    } else link.removeAttribute('aria-current');
  }
  const crumb = document.getElementById('crumb');
  if (crumb) crumb.textContent = view === 'home' ? 'Startseite' : label;
  const bar = document.querySelector('.topbar');
  if (bar?.dataset) bar.dataset.group = view === 'home' ? '' : group;
  updateProgress();
  const back = document.querySelector('[data-action="back"]');
  if (back) { back.disabled = viewStack.length === 0 && view === 'home'; }
  setMenu(false);
}

// Feine Linie unter der Kopfleiste: wie weit du im aktuellen Thema gelesen hast
function updateProgress() {
  const line = document.querySelector('.topbar-progress');
  if (!line?.style) return;
  const max = (document.documentElement.scrollHeight ?? 0) - (window.innerHeight ?? 0);
  line.style.transform = 'scaleX(' + (max > 40 ? Math.min(1, (window.scrollY ?? 0) / max) : 0) + ')';
}

// Reiter innerhalb einer Ansicht (z. B. Skills: Alle Skills / Welcher Skill passt?)
function showSubview(viewElement, key) {
  if (!viewElement?.querySelectorAll) return;
  for (const panel of viewElement.querySelectorAll('[data-subview]')) panel.classList.toggle('is-active', panel.dataset.subview === key);
  for (const tab of viewElement.querySelectorAll('[data-subview-tab]')) tab.setAttribute('aria-selected', String(tab.dataset.subviewTab === key));
}

function firstSubview(viewElement) {
  return viewElement?.querySelector?.('[data-subview]')?.dataset.subview;
}

function navigate(id, { push = true, notify = true, focus = push } = {}) {
  const view = viewOf(id);
  if (!view) return false;
  if (push && currentView && view !== currentView) viewStack.push({ view: currentView, y: window.scrollY ?? 0 });
  showView(view);
  const target = document.getElementById(id);
  const viewElement = target?.closest?.('#inhalt > [data-view]');
  const panel = target?.closest?.('[data-subview]');
  if (panel) showSubview(viewElement, panel.dataset.subview);
  else if (viewElement && firstSubview(viewElement)) showSubview(viewElement, firstSubview(viewElement));
  openLinkedLesson(id);
  const root = !target || target.dataset?.view || id === 'start' || id === 'inhalt';
  if (root) window.scrollTo?.(0, 0);
  else target.scrollIntoView?.({ block: 'start', behavior: 'instant' });
  if (focus) {
    const heading = root ? viewElement?.querySelector?.('h1, h2') : null;
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
    else if (target?.matches?.('summary, a, button, input, select, textarea')) target.focus?.({ preventScroll: true });
  }
  if (notify && typeof CustomEvent === 'function') window.dispatchEvent?.(new CustomEvent('academy-link', { detail: id }));
  if (push) { try { history.pushState({ id }, '', '#' + id); } catch { /* Vorschau ohne eigene Adresse */ } }
  return true;
}

function goBack() {
  const previous = viewStack.pop();
  if (!previous) return navigate('start', { push: false, focus: true });
  showView(previous.view);
  document.querySelector('#inhalt > [data-view].is-active')?.querySelector?.('h1, h2')?.focus?.({ preventScroll: true });
  window.scrollTo?.(0, previous.y);
  try { history.replaceState(null, '', previous.view === 'home' ? '#start' : '#' + previous.view); } catch { /* ohne Adresse */ }
}

function goHome() {
  navigate('start');
}

function setMenu(open) {
  const button = document.querySelector('[data-action="menu"]');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.querySelector('.sidebar-backdrop');
  if (!button || !sidebar) return;
  const wasOpen = sidebar.classList.contains('is-open');
  sidebar.classList.toggle('is-open', open);
  button.setAttribute('aria-expanded', String(open));
  if (backdrop) backdrop.hidden = !open;
  if (open) sidebar.querySelector('a, summary')?.focus?.();
  else if (wasOpen && sidebar.contains?.(document.activeElement)) button.focus?.();
}

// Im offenen Handy-Menü bleibt der Tastaturfokus im Menü
function trapMenuFocus(event) {
  const sidebar = document.getElementById('sidebar');
  if (event.key !== 'Tab' || !sidebar?.classList.contains('is-open')) return;
  const items = Array.from(sidebar.querySelectorAll('a, summary')).filter(item => item.offsetParent !== null);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

// Unter jeder Ansicht: vorheriges und nächstes Thema in der Reihenfolge der Seitenleiste
function buildPager() {
  const links = Array.from(document.querySelectorAll('.sidebar nav a[href^="#"]'));
  const order = links.map(link => ({ id: link.getAttribute('href').slice(1), label: link.textContent.trim(), group: groupOf(link) }));
  order.forEach((entry, index) => {
    const viewElement = document.getElementById(entry.id)?.closest?.('#inhalt > [data-view]');
    if (!viewElement) return;
    const host = viewElement.dataset.view === 'home' ? document.getElementById('einstieg') : viewElement;
    if (!host || host.querySelector(':scope > .view-pager')) return;
    const pager = document.createElement('div');
    pager.classList.add('view-pager');
    if (!host.classList.contains('wrap')) pager.classList.add('wrap');
    pager.setAttribute('aria-label', 'Themen blättern');
    for (const [neighbour, direction] of [[order[index - 1], 'prev'], [order[index + 1], 'next']]) {
      if (!neighbour) { pager.append(document.createElement('span')); continue; }
      const link = document.createElement('a');
      link.href = '#' + neighbour.id;
      link.className = 'pager-link pager-' + direction;
      const small = document.createElement('small');
      small.textContent = direction === 'prev' ? '← Vorheriges Thema' : 'Nächstes Thema →';
      const strong = document.createElement('strong');
      strong.textContent = (neighbour.group && neighbour.id !== 'start' ? neighbour.group + ' › ' : '') + neighbour.label;
      link.append(small, strong);
      pager.append(link);
    }
    host.append(pager);
  });
}

if (viewRoot) {
  document.documentElement.classList?.add('js-views');
  window.addEventListener('scroll', () => requestAnimationFrame(updateProgress), { passive: true });
  buildPager();
  for (const view of document.querySelectorAll('#inhalt > [data-view]')) if (firstSubview(view)) showSubview(view, firstSubview(view));
  navigate(location.hash.slice(1) || 'start', { push: false, notify: false });
  window.addEventListener('popstate', () => { viewStack.pop(); navigate(location.hash.slice(1) || 'start', { push: false }); });
  window.addEventListener('hashchange', () => navigate(location.hash.slice(1) || 'start', { push: false }));
  document.addEventListener?.('click', event => {
    const action = event.target?.closest?.('[data-action]')?.dataset.action;
    if (action === 'back') return goBack();
    if (action === 'home') return goHome();
    if (action === 'menu') return setMenu(!document.getElementById('sidebar').classList.contains('is-open'));
    if (action === 'close-menu') return setMenu(false);
    const tab = event.target?.closest?.('[data-subview-tab]');
    if (tab) { showSubview(tab.closest('[data-view]'), tab.dataset.subviewTab); tab.closest('[data-view]')?.querySelector('.subnav')?.scrollIntoView?.({ block: 'start', behavior: 'instant' }); return; }
    if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target?.closest?.('a[href^="#"]');
    const id = link?.getAttribute('href').slice(1);
    if (!id || !document.getElementById(id)) return;
    event.preventDefault?.();
    if (id === 'inhalt') { viewRoot.setAttribute('tabindex', '-1'); viewRoot.focus?.(); return; }
    navigate(id);
  });
  document.addEventListener?.('keydown', event => {
    if (event.key === 'Escape') setMenu(false);
    trapMenuFocus(event);
    const tab = event.target?.closest?.('[data-subview-tab]');
    if (tab && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
      const tabs = Array.from(tab.parentElement.querySelectorAll('[data-subview-tab]'));
      const next = tabs[(tabs.indexOf(tab) + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      event.preventDefault();
      next.focus();
      showSubview(tab.closest('[data-view]'), next.dataset.subviewTab);
    }
  });
}
