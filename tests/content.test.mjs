import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog } from '../src/content.mjs';

test('kanonischer Katalog hat eindeutige IDs und alle geforderten Bereiche', () => {
  assert.equal(catalog.worlds.length, 6);
  assert.equal(catalog.competencies.length, 14);
  assert.equal(catalog.skills.length, 20);
  assert.equal(catalog.cases.length, 25);
  assert.equal(catalog.cases.filter(c => c.deep).length, 8);
  assert.equal(catalog.perspectives.length, 12);
  assert.equal(catalog.gameQuestions.length, 60);
  assert.equal(catalog.assessment.length, 24);
  assert.equal(catalog.crises.length, 3);
  for (const group of ['worlds', 'competencies', 'skills', 'cases', 'perspectives', 'evidence']) {
    assert.equal(new Set(catalog[group].map(item => item.id)).size, catalog[group].length, group);
  }
});

test('Skills enthalten sechs konkrete Phasen und zwei unterschiedliche Niveaus', () => {
  for (const skill of catalog.skills) {
    assert.equal(skill.steps.length, 6);
    assert.ok(skill.steps.every(step => step.length > 25), skill.id);
    assert.notEqual(skill.levels.foundation.task, skill.levels.executive.task);
    assert.notEqual(skill.levels.foundation.feedback, skill.levels.executive.feedback);
    assert.ok(catalog.worlds.some(world => world.id === skill.worldId));
    assert.ok(skill.evidenceIds.every(id => catalog.evidence.some(e => e.id === id)));
  }
});

test('Fälle sind synthetisch gekennzeichnet und haben überprüfbare Entscheidungsarbeit', () => {
  for (const item of catalog.cases) {
    assert.equal(item.synthetic, true);
    assert.ok(item.scenario.length > 60, item.id);
    assert.equal(item.options.length, 3);
    assert.ok(item.counterpoint && item.risk && item.measure && item.reversal);
  }
});
