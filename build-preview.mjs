import { readdir, readFile, writeFile } from 'node:fs/promises';

const read = (name, encoding = 'utf8') => readFile(new URL(name, import.meta.url), encoding);

const [page, styles, demo, hero, gameStyles, gameScript] = await Promise.all([
  read('index.html'),
  read('site.css'),
  read('site.js'),
  read('hero-preview.jpg', 'base64'),
  read('spiel.css'),
  read('spiel.js'),
]);

const fontFiles = (await readdir(new URL('fonts/', import.meta.url))).filter(file => file.endsWith('.woff2'));
const fonts = new Map(await Promise.all(fontFiles.map(async file => [file, await read('fonts/' + file, 'base64')])));

function inline(html, replacements) {
  let result = html;
  for (const [marker, replacement] of replacements) {
    if (!result.includes(marker)) throw new Error('Missing preview marker: ' + marker);
    result = result.replace(marker, () => replacement);
  }
  return result.replace(/url\("fonts\/([\w.-]+\.woff2)"\)/g, (_, file) => {
    if (!fonts.has(file)) throw new Error('Missing font: ' + file);
    return 'url("data:font/woff2;base64,' + fonts.get(file) + '")';
  });
}

// Spiel: Joker-Prompts kommen unverändert aus den Skill-Prompts der Academy.
const unescape = text => text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const prompts = Object.fromEntries([...page.matchAll(/<textarea id="prompt-([\w-]+)" rows="9" readonly>([\s\S]*?)<\/textarea>/g)].map(([, slug, text]) => [slug, unescape(text)]));
if (Object.keys(prompts).length !== 20) throw new Error('Expected 20 skill prompts, found ' + Object.keys(prompts).length);
const promptJson = JSON.stringify(prompts).replace(/</g, '\\u003c');
if (!gameScript.includes('/*PROMPTS*/{}')) throw new Error('Missing PROMPTS marker in spiel.js');

// Alles auf einer Seite: Academy und Spiel in einer Datei, Spielcode gekapselt, Spielstile auf #spiel begrenzt.
const preview = inline(page, new Map([
  ['<link rel="stylesheet" href="site.css">\n  <link rel="stylesheet" href="spiel.css">', '<style>\n' + styles + '\n' + gameStyles + '</style>'],
  ['<script defer src="site.js"></script>\n  <script defer src="spiel.js" data-part="spiel"></script>', ''],
  ['src="hero.png"', 'src="data:image/jpeg;base64,' + hero + '"'],
  ['</body>', '<script>\n' + demo + '</script>\n<script data-part="spiel">\n' + gameScript.replace('/*PROMPTS*/{}', () => promptJson) + '</script>\n</body>'],
]));

await writeFile(new URL('../Academy-Vorschau.html', import.meta.url), preview);
