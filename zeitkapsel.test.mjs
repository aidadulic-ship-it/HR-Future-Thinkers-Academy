import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../Academy-Vorschau.html', import.meta.url), 'utf8');
const section = id => html.split('<section id="' + id + '"')[1]?.split('</section>')[0] ?? '';

function loadLogic() {
  const context = { window: { addEventListener() {} }, location: { hash: '' }, document: { querySelector: () => null, querySelectorAll: () => [], getElementById: () => null } };
  for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) runInNewContext(script, context);
  return context;
}

test('der Hero nennt das Versprechen der Academy', () => {
  const hero = html.split('<section class="hero')[1]?.split('</section>')[0] ?? '';
  assert.match(hero, /<p class="usp">Die Academy, in der KI dir widerspricht\.[^<]*begründen kannst\.<\/p>/);
  assert.ok(hero.indexOf('class="usp"') < hero.indexOf('class="intro"'));
});

test('die Zeitkapsel hat Anonymisierungs-Tor, Vorhersage mit Sicherheit, Frist, Thema und Öffnen per Datei', () => {
  const capsule = section('zeitkapsel');
  const form = capsule.split('<form id="kapsel-form"')[1]?.split('</form>')[0] ?? '';
  assert.equal([...form.matchAll(/type="checkbox" name="anonym" required/g)].length, 3);
  for (const name of ['entscheidung', 'vorhersage', 'kriterium']) assert.match(form, new RegExp('name="' + name + '"[^>]*required'), name);
  const options = name => [...(form.split('<select name="' + name + '"')[1]?.split('</select>')[0] ?? '').matchAll(/<option value="([^"]+)"/g)].map(([, v]) => v);
  assert.deepEqual(options('sicherheit'), ['50', '60', '70', '80', '90', '100']);
  assert.deepEqual(options('frist'), ['30', '60', '90', '180']);
  assert.ok(options('thema').length >= 5);
  assert.match(capsule, /<input type="file" id="kapsel-datei" accept="\.json,application\/json" multiple>/);
  assert.ok(capsule.includes('id="kapsel-profil"'));
  assert.match(capsule, /nicht gespeichert|bleib(t|en) auf deinem Gerät/);
});

test('eine Kapsel enthält Vorhersage, Sicherheit und Fälligkeitsdatum und lässt sich als Datei sichern und wieder lesen', () => {
  const logic = loadLogic();
  const now = new Date('2026-11-11T10:00:00');
  const capsule = logic.buildCapsule({ entscheidung: 'Interviewfenster bündeln', vorhersage: 'Besetzungszeit unter 60 Tage', kriterium: 'Median Freigabe bis Zusage', sicherheit: '70', frist: '90', thema: 'Recruiting' }, now);
  assert.equal(capsule.sicherheit, 70);
  assert.equal(capsule.faellig, '2027-02-09');
  assert.equal(capsule.ergebnis, null);
  assert.ok(capsule.id);
  const text = logic.capsuleFileText([capsule]);
  const parsed = logic.parseCapsuleFile(text);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].vorhersage, 'Besetzungszeit unter 60 Tage');
  assert.throws(() => logic.parseCapsuleFile('{"type":"etwas anderes","capsules":[]}'));
  assert.throws(() => logic.parseCapsuleFile('kein json'));
  assert.throws(() => logic.parseCapsuleFile(JSON.stringify({ type: 'hrfta-zeitkapsel', version: 1, capsules: [{ id: 'x', sicherheit: 140 }] })));
  const merged = logic.mergeCapsules([capsule], [{ ...capsule, ergebnis: 'ja' }]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].ergebnis, 'ja');
});

test('das Urteilsprofil vergleicht Sicherheit mit Trefferquote und warnt bei zu wenigen Entscheidungen', () => {
  const logic = loadLogic();
  const make = (sicherheit, ergebnis, thema) => ({ id: Math.random().toString(36), sicherheit, ergebnis, thema, vorhersage: 'x', entscheidung: 'y', kriterium: 'z', faellig: '2027-01-01' });
  const few = logic.calibrationProfile([make(70, 'ja', 'Recruiting'), make(70, 'nein', 'Recruiting'), make(90, 'unklar', 'Führung'), make(80, null, 'Führung')]);
  assert.equal(few.resolved, 2);
  assert.equal(few.open, 1);
  assert.equal(few.unclear, 1);
  assert.match(few.hinweis, /zu wenige/);
  const caps = [
    ...Array.from({ length: 5 }, (_, i) => make(90, i < 3 ? 'ja' : 'nein', 'Recruiting')),
    ...Array.from({ length: 5 }, (_, i) => make(60, i < 3 ? 'ja' : 'nein', 'Führung')),
  ];
  const profile = logic.calibrationProfile(caps);
  assert.equal(profile.resolved, 10);
  const ninety = profile.levels.find(level => level.sicherheit === 90);
  assert.equal(ninety.anzahl, 5);
  assert.equal(ninety.treffer, 60);
  assert.match(ninety.einschaetzung, /überschätzt/);
  const sixty = profile.levels.find(level => level.sicherheit === 60);
  assert.match(sixty.einschaetzung, /passend/);
  assert.equal(Math.round(profile.brier * 1000), Math.round(((0.01 * 3 + 0.81 * 2) + (0.16 * 3 + 0.36 * 2)) / 10 * 1000));
  assert.deepEqual(JSON.parse(JSON.stringify(profile.themen.map(t => [t.thema, t.anzahl, t.treffer]))), [['Führung', 5, 60], ['Recruiting', 5, 60]]);
  assert.ok(!/zu wenige/.test(profile.hinweis));
});

test('die Zeitkapsel sagt ausdrücklich, dass keine Anmeldung nötig ist', () => {
  const capsule = section('zeitkapsel');
  assert.match(capsule, /<p class="capsule-free">Ohne Anmeldung, ohne Konto, ohne E-Mail-Adresse\./);
  assert.doesNotMatch(capsule, /type="(email|password)"/);
});
