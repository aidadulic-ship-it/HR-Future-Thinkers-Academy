import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {catalog} from '../src/content.mjs';

test('alle übergebenen Prompt- und Lehrinhalte sind im Katalog verknüpft',()=>{
  assert.equal(catalog.prompts.length,20);
  assert.equal(catalog.grills.length,12);
  assert.equal(catalog.workbench.length,14);
  assert.equal(catalog.teaching.timeline.length,5);
  assert.equal(catalog.teaching.rubric.length,4);
  assert.equal(catalog.teaching.roleplays.length,2);
  assert.equal(catalog.teaching.retrieval.length,3);
  assert.equal(catalog.cases.filter(c=>c.originalCase).length,8);
  const promptIds=new Set(catalog.prompts.map(x=>x.id));
  assert.equal(promptIds.size,20);
  assert.equal(new Set(catalog.prompts.map(x=>x.prompt)).size,20);
  for(const p of catalog.prompts){assert.equal(p.steps.length,6,p.id);assert.ok(p.prompt.length>500,p.id);assert.ok(catalog.cases.some(c=>c.id===p.caseId),p.id)}
  for(const g of catalog.grills){assert.ok(g.question&&g.feedback&&g.followUp&&g.prompt.length>1000,g.id)}
  for(const s of catalog.skills){assert.ok(s.relatedPromptIds.length>0,s.id);assert.ok(s.relatedPromptIds.every(id=>promptIds.has(id)),s.id);assert.ok(catalog.cases.some(c=>c.id===s.caseId),s.id)}
  for(const p of catalog.perspectives){assert.ok(catalog.grills.some(g=>g.id===p.grillId),p.id);assert.ok(p.caseQuestion,p.id)}
});

test('GitHub-Pages-Daten entsprechen dem Server-Katalog',()=>{
  const staticCatalog=JSON.parse(readFileSync(new URL('../content.json',import.meta.url),'utf8'));
  assert.deepEqual(staticCatalog,catalog);
});
