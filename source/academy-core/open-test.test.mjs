import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('alle internen Navigationsziele der Academy existieren', () => {
  const html = readFileSync(new URL('index.html', import.meta.url), 'utf8');
  const links = [...html.matchAll(/href="#([^"]+)"/g)];
  assert.ok(links.length >= 8);
  for (const [, target] of links) assert.ok(html.includes('id="' + target + '"'), target);
  assert.ok(html.includes('90-Minuten-Lehrplan'));
  assert.ok(html.includes('Bewertungsrubrik'));
});


