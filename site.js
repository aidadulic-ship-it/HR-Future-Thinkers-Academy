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

function openLinkedLesson() {
  const target = document.getElementById(location.hash.slice(1));
  const lesson = target?.closest('details');
  if (lesson) lesson.open = true;
}

window.addEventListener('hashchange', openLinkedLesson);
openLinkedLesson();

