import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
const game = html.split('<div id="spiel"')[1]?.split('<!-- /SPIEL -->')[0] ?? '';

test('das Spiel ist Teil der Academy-Seite, ohne eigene Datei', () => {
  assert.ok(!existsSync(new URL('./spiel.html', import.meta.url)), 'keine eigene spiel.html mehr');
  assert.ok(!existsSync(new URL('../Spiel-Vorschau.html', import.meta.url)), 'keine eigene Spiel-Vorschau mehr');
  assert.ok(game.includes('id="screen-start"') && game.includes('id="screen-crisis"') && game.includes('id="joker-dialog"'));
  assert.doesNotMatch(html, /href="spiel\.html/);
  assert.doesNotMatch(game, /href="index\.html/);
  assert.doesNotMatch(game, /target="_blank"/);
  assert.match(html, /<nav[\s\S]*?<a href="#spiel">Spiel<\/a>[\s\S]*?<\/nav>/);
  assert.match(html, /<a class="entry-card entry-game" href="#spiel">/);
  assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1, 'genau eine Hauptüberschrift');
});

test('Spielcode und Spielstile stören die Academy nicht', () => {
  const script = html.match(/<script data-part="spiel">([\s\S]*?)<\/script>/)?.[1] ?? '';
  assert.match(script.trim(), /^\/\*[^]*?\*\/\s*\(\(\) => \{/);
  assert.match(script.trim(), /\}\)\(\);$/);
  const css = html.split('<style>')[1].split('</style>')[0];
  const gamePart = (css.split('Spielstile, auf #spiel begrenzt */')[1] ?? '').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(gamePart.length > 1000);
  for (const [, selector] of gamePart.matchAll(/(?:^|[{}])\s*([^{}]+)\{/g)) {
    if (/^\s*(from|to|\d+%|@)/.test(selector)) continue;
    for (const part of selector.split(',')) assert.match(part.trim(), /^#spiel\b/, part.trim());
  }
  assert.doesNotMatch(gamePart, /@font-face/);
});

test('Krisenfälle führen direkt in den Krisenmodus auf derselben Seite', () => {
  const krisen = html.split('<section id="krisen"')[1].split('</section>')[0];
  for (const nr of [1, 2, 3]) assert.ok(krisen.includes('href="#spiel-krise-' + nr + '"'), 'krise-' + nr);
  const script = html.match(/<script data-part="spiel">([\s\S]*?)<\/script>/)[1];
  assert.match(script, /addEventListener\('hashchange'/);
  assert.match(script, /'#spiel-krise'/);
});
