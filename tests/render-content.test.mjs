import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {catalog} from '../src/content.mjs';

function render(expression){
  const raw=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  const script=raw.slice(0,raw.lastIndexOf('try{state.catalog=await api'));
  const element={innerHTML:'',textContent:'',classList:{remove(){},toggle(){}},addEventListener(){}};
  const context={catalog,document:{documentElement:{dataset:{staticPreview:'true'}},querySelector(){return element},addEventListener(){}},localStorage:{getItem(){return null}},setTimeout(){},window:{scrollTo(){}}};
  return runInNewContext(`${script}\nstate.catalog=catalog; ${expression}`,context);
}

test('Practice Studio öffnet übernommene Prompt-Vorlage und Workshop mit Inhalt',()=>{
  const page=render(`state.page='practice'; state.selected={type:'prompt',id:'PROMPT-01'}; practicePage()`);
  assert.match(page,/Arbeite als kritischer HR-Lerncoach/);
  assert.match(page,/Welche Zahl würde jede Annahme widerlegen/);
  assert.match(page,/data-action="save-prompt"/);
  assert.match(page,/data-action="open-case"/);
  const workbench=render(`state.page='practice'; state.selected={type:'workbench'}; practicePage()`);
  assert.match(workbench,/data-workbench="w13"/);
  assert.match(workbench,/data-action="save-workbench"/);
});

test('Lehrendenbereich zeigt zwölf Grill-me-Perspektiven und vollständige Materialien',()=>{
  const page=render(`state.page='teaching'; state.selected={type:'grill',id:'GRILL-01'}; teachingPage()`);
  assert.equal((page.match(/data-action="open-grill"/g)||[]).length,12);
  assert.match(page,/30-Tage-Lernfahrplan/);
  assert.match(page,/90-Minuten-Fallseminar/);
  assert.match(page,/Bewertungsrubrik/);
  assert.match(page,/Rollenbriefings/);
  assert.match(page,/Prüfmaßstab zeigen/);
  assert.match(page,/data-action="save-grill"/);
});

test('Executive-Fall und Skill sind mit übernommenen Inhalten verbunden',()=>{
  const decision=render(`state.page='decisions'; state.selected={type:'case',id:'CASE-001'}; decisionsPage()`);
  assert.match(decision,/Ausgearbeitete Original-Fallstudie öffnen/);
  assert.match(decision,/120\.000/);
  const skill=render(`state.page='worlds'; state.selected={type:'skill',id:'SKILL-001'}; worldsPage()`);
  assert.match(skill,/Passende Prompt-Vorlagen und Fall/);
  assert.match(skill,/data-id="PROMPT-02"/);
  assert.match(skill,/data-id="CASE-002"/);
});

test('Grill-me und Für Lehrende sind direkt von der Startseite erreichbar',()=>{
  const home=render('pathPage()');
  assert.match(home,/data-action="show-grills"/);
  assert.match(home,/Für Lehrende/);
  assert.match(home,/data-id="teaching"/);
  const practice=render('practicePage()');
  assert.match(practice,/Grill-me für Lehrende/);
  const teaching=render('teachingPage()');
  assert.match(teaching,/<h1>Für Lehrende<\/h1>/);
  assert.match(teaching,/id="grill-library"/);
});

test('Spiel ist direkt sichtbar und öffnet die erste von 60 Fragen',()=>{
  const home=render('pathPage()');
  assert.match(home,/HR Mastermind spielen/);
  assert.match(home,/06 · SPIEL/);
  assert.match(home,/data-action="start-game"/);
  const game=render(`state.page='practice'; state.selected={type:'game'}; practicePage()`);
  assert.match(game,/HR Mastermind/);
  assert.match(game,/1\/60/);
  assert.match(game,/Fiktiver Fall:/);
  assert.match(game,/12 von durchschnittlich 80 Personen/);
  assert.match(game,/Ausgangsdaten:/);
  assert.match(game,/12\/80 vs\. 5\/70/);
  assert.match(game,/keine automatische Bewertung/);
  assert.match(game,/Skill-Workflow öffnen/);
  assert.match(game,/data-action="save-game"/);
  assert.match(game,/data-action="next-game"/);
  assert.equal((game.match(/data-action="game-level"/g)||[]).length,5);
});
