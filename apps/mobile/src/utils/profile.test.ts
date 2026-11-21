import assert from 'node:assert/strict';
import test from 'node:test';
import { emptyProfile, validateProfile } from './profile';

test('consent off clears optional health fields', () => {
  const { profile, errors } = validateProfile({
    ...emptyProfile,
    displayName: '  Sara  ',
    consent: false,
    age: '30',
    allergies: 'egg',
    goal: 'healthy',
  });
  assert.equal(profile.displayName, 'Sara');
  assert.equal(profile.age, '');
  assert.equal(profile.allergies, '');
  assert.equal(profile.goal, '');
  assert.deepEqual(errors, {});
});

test('under 18 is not stored', () => {
  const { errors } = validateProfile({ ...emptyProfile, consent: true, age: '12' });
  assert.match(errors.age ?? '', /under 18/);
});
