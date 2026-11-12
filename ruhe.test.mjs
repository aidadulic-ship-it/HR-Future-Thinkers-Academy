import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
const section = id => html.split('<section id="' + id + '"')[1]?.split('</section>')[0] ?? '';

test('Karten öffnen ohne Springen: die angeklickte Karte bleibt an ihrer Stelle, andere Karten schließen sich', () => {
  const handlers = {};
  const scrolls = [];
  let layoutShift = 0;
  const grid = { cards: [], querySelectorAll() { return this.cards.filter(card => card.open); } };
  const makeCard = (top, open = false) => {
    const card = { open, parentElement: grid, listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; } };
    card.summary = { parentElement: card, closest: () => card.summary, getBoundingClientRect: () => ({ top: top + layoutShift }) };
    grid.cards.push(card);
    return card;
  };
  const first = makeCard(100, true);
  const second = makeCard(600);
  const context = {
    window: { addEventListener() {}, scrollBy: options => scrolls.push(options) }, location: { hash: '' },
    document: {
      querySelector: () => null, getElementById: () => null,
      querySelectorAll: selector => selector === '.card-grid > details' ? grid.cards : [],
      addEventListener: (type, fn, capture) => { handlers[type + (capture ? ':capture' : '')] = fn; },
    },
  };
  for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) runInNewContext(script, context);
  assert.ok(handlers['click:capture'], 'Klick wird vor dem Umbau gemessen');
  handlers['click:capture']({ target: second.summary });
  second.open = true;
  layoutShift = 340; // der Inhalt darüber hat sich verändert
  second.listeners.toggle();
  assert.equal(first.open, false, 'die zuvor offene Karte schließt sich');
  assert.equal(scrolls.length, 1);
  assert.equal(scrolls[0].top, 340);
  assert.equal(scrolls[0].behavior, 'instant');
});

test('Reality Check: Ablauf und Protokoll folgen denselben vier Schritten, keine doppelte Protokollvorlage', () => {
  const workshop = section('workshops');
  assert.doesNotMatch(workshop, /Protokollvorlage/);
  assert.match(workshop, /<summary>Workbench öffnen · Protokoll in vier Schritten ausfüllen und exportieren<\/summary>/);
  assert.match(workshop, /<details class="workbench-details" id="workbench">/);
  assert.match(workshop.split('Workshop-Ablauf')[1], /href="#workbench"/);
  const form = workshop.split('id="workbench-form"')[1].split('</form>')[0];
  const steps = [...form.matchAll(/<fieldset class="workbench-step"><legend>Schritt (\d) · ([^<]+)<\/legend>([\s\S]*?)<\/fieldset>/g)];
  assert.deepEqual(steps.map(([, nr]) => nr), ['1', '2', '3', '4']);
  assert.deepEqual(steps.map(([, , , body]) => [...body.matchAll(/class="workbench-field"/g)].length), [2, 4, 3, 5]);
  const flow = [...workshop.split('Workshop-Ablauf')[1].split('</ol>')[0].matchAll(/<li><strong>([^<]+)<\/strong>/g)].map(([, title]) => title.replace(/\.$/, ''));
  assert.deepEqual(steps.map(([, , title]) => title), flow);
});
