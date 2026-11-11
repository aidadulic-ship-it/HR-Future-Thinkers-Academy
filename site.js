const form = document.querySelector('#brief-form');
const output = document.querySelector('#brief-output');
const brief = document.querySelector('#brief-text');

const sections = [
  ['option', 'EMPFEHLUNG UND ALTERNATIVE'],
  ['evidence', 'EVIDENZ UND UNSICHERHEIT'],
  ['guardrail', 'PILOTGRENZE UND STOPPKRITERIUM'],
  ['review', 'VERANTWORTUNG UND REVIEW'],
];

form.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const paragraphs = sections.map(([key, title]) => title + '\n' + data.get(key).trim());
  brief.value = ['EXECUTIVE BRIEFING · KI IM RECRUITING', ...paragraphs].join('\n\n');
  output.hidden = false;
  brief.focus();
});


for (const workflow of document.querySelectorAll('.skill-workflow')) {
  workflow.addEventListener('submit', event => {
    event.preventDefault();
    const result = workflow.querySelector('.skill-result');
    const record = result.querySelector('.skill-record');
    const download = result.querySelector('.skill-download');
    const title = workflow.querySelector('.workflow-output').textContent;
    const steps = Array.from(workflow.querySelectorAll('textarea[name]'), field =>
      field.labels[0].textContent.trim() + '\n' + field.value.trim()
    );
    record.value = [title, ...steps].join('\n\n');
    download.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(record.value);
    result.hidden = false;
    record.focus();
  });
}


function normalizeSkillSearch(value) {
  return value.toLocaleLowerCase('de').normalize('NFKD').replace(/\p{M}/gu, '').replace(/ß/g, 'ss');
}

const skillSearch = document.getElementById('skill-search');
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
      element.hidden = !terms.every(term => text.includes(term));
      if (!element.hidden) matches++;
    }
    status.textContent = matches ? matches + ' von ' + skills.length + ' Skills' : 'Keine Skills gefunden. Probiere einen anderen Suchbegriff.';
  };
  skillSearch.addEventListener('input', filterSkills);
  filterSkills();
}

function openLinkedLesson() {
  const target = document.getElementById(location.hash.slice(1));
  const lesson = target?.closest('details');
  if (lesson?.hidden && skillSearch) {
    skillSearch.value = '';
    skillSearch.dispatchEvent(new Event('input'));
  }
  if (lesson) lesson.open = true;
}

window.addEventListener('hashchange', openLinkedLesson);
openLinkedLesson();



const workbenchForm = document.getElementById('workbench-form');
if (workbenchForm) {
  workbenchForm.addEventListener('submit', event => {
    event.preventDefault();
    const fields = Array.from(workbenchForm.querySelectorAll('[name]'), field => {
      const label = field.labels[0].firstChild.textContent.trim();
      return label + '\n' + (field.value.trim() || 'Offen');
    });
    const record = document.getElementById('workbench-record');
    record.value = ['HR UNLEARN IT · WORKSHOP-PROTOKOLL', ...fields].join('\n\n');
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
  selectTeacherTab(0);
}

