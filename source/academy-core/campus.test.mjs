import test from 'node:test';
import assert from 'node:assert/strict';
import { Academy } from './academy.mjs';

function setup() {
  const academy = new Academy();
  academy.addAccount('owner', 'platform-admin');
  academy.addAccount('teacher');
  academy.addAccount('learner');
  academy.addAccount('visitor');
  return academy;
}

function openCampus(academy, name = 'Campus Wien', seats = 2) {
  const id = academy.requestCampus('teacher', name);
  academy.approveCampus('owner', id, seats);
  return id;
}

test('Antrag bleibt bis zur zentralen Freigabe geschlossen', () => {
  const academy = setup();
  const id = academy.requestCampus('teacher', 'Campus Wien');
  assert.throws(() => academy.viewCampus('teacher', id), { message: 'forbidden' });
  assert.throws(() => academy.approveCampus('teacher', id, 2), { message: 'forbidden' });
  academy.approveCampus('owner', id, 2);
  assert.equal(academy.viewCampus('teacher', id).role, 'campus-admin');
  assert.throws(() => academy.approveCampus('owner', id, 4), { message: 'invalid_state' });
});

test('Mitgliedschaft und Rollen gelten ausschließlich im jeweiligen Campus', () => {
  const academy = setup();
  const vienna = openCampus(academy);
  const graz = openCampus(academy, 'Campus Graz');
  academy.addMember('teacher', vienna, 'learner', 'student');
  assert.equal(academy.viewCampus('learner', vienna).role, 'student');
  assert.throws(() => academy.viewCampus('learner', graz), { message: 'forbidden' });
  assert.throws(() => academy.addMember('learner', vienna, 'visitor', 'teacher'), { message: 'forbidden' });
  assert.throws(() => academy.addMember('teacher', graz, 'visitor', 'platform-admin'), { message: 'invalid_role' });
});

test('Lizenzgrenze gilt je Campus und freigegebene Plätze werden wieder nutzbar', () => {
  const academy = setup();
  const id = openCampus(academy);
  academy.addMember('teacher', id, 'learner', 'student');
  assert.throws(() => academy.addMember('teacher', id, 'visitor', 'student'), { message: 'seat_limit' });
  academy.removeMember('teacher', id, 'learner');
  academy.addMember('teacher', id, 'visitor', 'student');
  assert.equal(academy.viewCampus('visitor', id).role, 'student');
  assert.throws(() => academy.viewCampus('learner', id), { message: 'forbidden' });
});

test('Persönlicher Kompetenzpass bleibt nach Campus-Austritt privat verfügbar', () => {
  const academy = setup();
  const id = openCampus(academy);
  academy.addMember('teacher', id, 'learner', 'student');
  academy.recordPassportReflection('learner', 'Reflexion zur Fallstudie');
  academy.removeMember('teacher', id, 'learner');
  assert.deepEqual(academy.viewPassport('learner'), ['Reflexion zur Fallstudie']);
  assert.deepEqual(academy.viewPassport('teacher'), []);
});

