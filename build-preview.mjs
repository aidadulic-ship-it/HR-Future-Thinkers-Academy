import { readdir, readFile, writeFile } from 'node:fs/promises';

const read = (name, encoding = 'utf8') => readFile(new URL(name, import.meta.url), encoding);

const [page, styles, demo, hero] = await Promise.all([
  read('index.html'),
  read('site.css'),
  read('site.js'),
  read('hero-preview.jpg', 'base64'),
]);

const fontFiles = (await readdir(new URL('fonts/', import.meta.url))).filter(file => file.endsWith('.woff2'));
const fonts = new Map(await Promise.all(fontFiles.map(async file => [file, await read('fonts/' + file, 'base64')])));

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

preview = preview.replace(/url\("fonts\/([\w.-]+\.woff2)"\)/g, (_, file) => {
  if (!fonts.has(file)) throw new Error('Missing font: ' + file);
  return 'url("data:font/woff2;base64,' + fonts.get(file) + '")';
});

await writeFile(new URL('../Academy-Vorschau.html', import.meta.url), preview);
