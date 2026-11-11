import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
const section = id => html.split('<section id="' + id + '"')[1]?.split('</section>')[0] ?? '';

test('die Prompt-Bibliothek ist über Navigation und Skills erreichbar und enthält alle 20 Prompts ohne Sperre', () => {
  assert.match(html, /<nav[\s\S]*?<a href="#prompts">Prompts<\/a>[\s\S]*?<\/nav>/);
  const library = section('prompts');
  assert.match(library, /<h2>Prompt-Bibliothek<\/h2>/);
  const items = [...library.matchAll(/<textarea id="bib-([\w-]+)" rows="\d+" readonly data-title="[^"]+">([\s\S]*?)<\/textarea><div class="prompt-actions">/g)];
  assert.equal(items.length, 20);
  for (const [, slug, text] of items) {
    const original = html.match(new RegExp('<textarea id="prompt-' + slug + '" rows="9" readonly>([\\s\\S]*?)<\\/textarea>'))?.[1];
    assert.equal(text, original, slug);
  }
  assert.match(library, /id="bib-alle"[^>]*>Alle 20 Prompts als eine Textdatei speichern/);
  assert.ok(html.indexOf('<section id="prompts"') > html.indexOf('<section id="skills"'));
  assert.match(section('skills'), /href="#prompts"/);
});

test('jede Skill-Karte und jeder geöffnete Skill sagt, wo der KI-Prompt ist', () => {
  const cards = [...section('skills').matchAll(/<summary id="([\w-]+)">([\s\S]*?)<\/summary><div class="lesson">([\s\S]*?)<form class="skill-workflow"/g)];
  assert.equal(cards.length, 20);
  for (const [, slug, summary, lesson] of cards) {
    assert.ok(summary.includes('<span class="card-badge">Mit KI-Prompt</span>'), slug);
    assert.match(lesson, new RegExp('<p class="prompt-where">[^<]*Schritt 1 und 2[^<]*<a href="#bib-' + slug + '">'), slug);
  }
});

test('Alle 20 Prompts als eine Datei speichern', () => {
  const areas = [{ id: 'bib-a', value: 'Prompt A', dataset: { title: 'Skill A' } }, { id: 'bib-b', value: 'Prompt B', dataset: { title: 'Skill B' } }];
  const all = { listeners: {}, addEventListener(event, handler) { this.listeners[event] = handler; } };
  const context = {
    window: { addEventListener() {} }, location: { hash: '' },
    document: { querySelector: () => null, querySelectorAll: s => s === '#prompts textarea[id^="bib-"]' ? areas : [], getElementById: id => id === 'bib-alle' ? all : null },
  };
  for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) runInNewContext(script, context);
  all.listeners.click();
  const text = decodeURIComponent(all.href.split(',').slice(1).join(','));
  assert.match(text, /Skill A[\s\S]*Prompt A[\s\S]*Skill B[\s\S]*Prompt B/);
});
