import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');

test('jeder Prompt hat Kopieren und Speichern als Textdatei direkt darunter', () => {
  const prompts = [...html.matchAll(/<textarea id="((?:prompt|grill)-[\w-]+|duell-prompt)"[^>]*readonly>[\s\S]*?<\/textarea>(<div class="prompt-actions">[\s\S]*?<\/div>)?/g)];
  assert.equal(prompts.length, 33);
  for (const [, id, actions] of prompts) {
    assert.ok(actions, id);
    assert.ok(actions.includes('<button type="button" class="prompt-copy" data-target="' + id + '">Prompt kopieren</button>'), id);
    assert.ok(actions.includes('<a class="prompt-download" data-target="' + id + '" download="' + id + '.txt"'), id);
    assert.ok(actions.includes('class="prompt-status" role="status"'), id);
  }
});

test('Speichern übernimmt den aktuellen Prompt, Kopieren meldet den Erfolg', async () => {
  const area = { value: 'Arbeite als kritischer HR-Lerncoach [Fall oder Kontext]', select() { this.selected = true; } };
  const status = { textContent: '' };
  const listeners = {};
  const copy = { dataset: { target: 'prompt-x' }, addEventListener(event, handler) { listeners.copy = handler; } };
  const download = { dataset: { target: 'prompt-x' }, addEventListener(event, handler) { listeners.download = handler; } };
  const box = { querySelector: s => ({ '.prompt-copy': copy, '.prompt-download': download, '.prompt-status': status })[s] };
  let clipboard = '';
  const context = {
    window: { addEventListener() {} }, location: { hash: '' },
    navigator: { clipboard: { writeText: async text => { clipboard = text; } } },
    document: { querySelector: () => null, querySelectorAll: s => s === '.prompt-actions' ? [box] : [], getElementById: id => id === 'prompt-x' ? area : null },
  };
  for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) runInNewContext(script, context);
  listeners.download();
  assert.equal(decodeURIComponent(download.href.split(',').slice(1).join(',')), area.value);
  area.value = 'geänderter Prompt';
  listeners.download();
  assert.equal(decodeURIComponent(download.href.split(',').slice(1).join(',')), 'geänderter Prompt');
  await listeners.copy();
  assert.equal(clipboard, 'geänderter Prompt');
  assert.match(status.textContent, /kopiert/);
});
