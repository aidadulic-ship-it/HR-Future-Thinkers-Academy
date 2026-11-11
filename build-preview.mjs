import { readFile, writeFile } from 'node:fs/promises';

const read = (name, encoding = 'utf8') => readFile(new URL(name, import.meta.url), encoding);

const [page, styles, demo, hero] = await Promise.all([
  read('index.html'),
  read('site.css'),
  read('site.js'),
  read('hero-preview.jpg', 'base64'),
]);

const replacements = new Map([
  ['<link rel="stylesheet" href="site.css">', '<style>\n' + styles + '</style>'],
  ['<script defer src="site.js"></script>', ''],
  ['src="hero.png"', 'src="data:image/jpeg;base64,' + hero + '"'],
  ['</body>', '<script>\n' + demo + '</script>\n</body>'],
]);

let preview = page;
for (const [marker, replacement] of replacements) {
  if (!preview.includes(marker)) throw new Error('Missing preview marker: ' + marker);
  preview = preview.replace(marker, () => replacement);
}

await writeFile(new URL('../Academy-Vorschau.html', import.meta.url), preview);
