import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { catalog } from '../src/content.mjs';

const themeScript = readFileSync(new URL('../theme.js', import.meta.url), 'utf8');

function setupTheme(initial) {
  const storage = new Map(initial ? [['hr-future-thinkers-theme-v1', initial]] : []);
  const buttons = ['modern', 'classic'].map(choice => ({
    dataset: { themeChoice: choice },
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, handler) { this[name] = handler; }
  }));
  const document = {
    documentElement: { dataset: {} },
    querySelectorAll(selector) {
      assert.equal(selector, '[data-theme-choice]');
      return buttons;
    }
  };
  const localStorage = {
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, value); }
  };
  runInNewContext(themeScript, { document, localStorage });
  return { document, buttons, storage };
}

test('Designwechsel speichert nur die Darstellung und behält den Seitenzustand', () => {
  const view = setupTheme('classic');
  assert.equal(view.document.documentElement.dataset.theme, 'classic');
  assert.equal(view.buttons[1].attributes['aria-pressed'], 'true');
  view.buttons[0].click();
  assert.equal(view.document.documentElement.dataset.theme, 'modern');
  assert.equal(view.buttons[0].attributes['aria-pressed'], 'true');
  assert.equal(view.buttons[1].attributes['aria-pressed'], 'false');
  assert.equal(view.storage.get('hr-future-thinkers-theme-v1'), 'modern');
});

test('GitHub Pages und Server bieten denselben Designschalter und dieselben Inhalte', () => {
  const pages = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const server = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8');
  const serverCode = readFileSync(new URL('../src/server.mjs', import.meta.url), 'utf8');
  for (const html of [pages, server]) {
    assert.match(html, /data-theme-choice="modern"/);
    assert.match(html, /data-theme-choice="classic"/);
    assert.match(html, /aria-label="Design wählen"/);
  }
  assert.match(serverCode, /'\/theme\.js': \['\.\.\/theme\.js'/);
  assert.match(serverCode, /'\/app\.css': \['\.\.\/app\.css'/);
  assert.match(serverCode, /classic-staircase\.png/);
  const css = readFileSync(new URL('../app.css', import.meta.url), 'utf8');
  assert.match(css, /html\[data-theme="classic"\] \.sidebar\{position:sticky/);
  assert.match(css, /html\[data-theme="classic"\] \.hero-art\{[^}]*classic-staircase\.png/);
  assert.match(css, /html\[data-theme="classic"\] \.hero-art-title\{display:block/);
  assert.doesNotMatch(readFileSync(new URL('../app.js', import.meta.url), 'utf8'), /data-theme|themeChoice/);
  assert.equal(
    readFileSync(new URL('../app.js', import.meta.url), 'utf8'),
    readFileSync(new URL('../src/app.js', import.meta.url), 'utf8')
  );
});

test('alle sechs Academy-Bereiche rendern in beiden Designs denselben Inhalt', () => {
  const raw = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
  const script = raw.slice(0, raw.lastIndexOf('try{state.catalog=await api'));
  function renderPages(theme) {
    const element = { innerHTML: '', textContent: '', classList: { remove(){}, toggle(){} }, addEventListener(){} };
    const context = {
      catalog,
      document: { documentElement: { dataset: { staticPreview: 'true', theme } }, querySelector(){return element}, addEventListener(){} },
      localStorage: { getItem(){return null} }, setTimeout(){}, window: { scrollTo(){} }
    };
    return runInNewContext(`${script}\nstate.catalog=catalog; JSON.stringify([pathPage(),worldsPage(),decisionsPage(),knowledgePage(),practicePage(),teachingPage()])`, context);
  }
  assert.equal(renderPages('modern'), renderPages('classic'));
});
