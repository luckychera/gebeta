import assert from 'node:assert/strict';
import test from 'node:test';
import { goalOptions } from '../data/options';
import { emptyProfile, normalizeProfile, toggleValue, validateProfile } from './profile';

test('consent off clears optional health fields', () => {
  const { profile, errors } = validateProfile({
    ...emptyProfile,
    displayName: '  Sara  ',
    consent: false,
    age: '30',
    allergies: 'egg',
    goal: 'healthy',
    lifeStage: 'pregnant',
    healthContext: ['Diabetes'],
  });
  assert.equal(profile.displayName, 'Sara');
  assert.equal(profile.age, '');
  assert.equal(profile.allergies, '');
  assert.equal(profile.goal, '');
  assert.equal(profile.lifeStage, '');
  assert.deepEqual(profile.healthContext, []);
  assert.deepEqual(errors, {});
});

test('under 18 is not stored', () => {
  const { errors } = validateProfile({ ...emptyProfile, consent: true, age: '12' });
  assert.match(errors.age ?? '', /under 18/);
});

test('normalizeProfile fills missing fields from an older saved record', () => {
  const profile = normalizeProfile({ displayName: 'Abebe', consent: true, age: '34', goal: 'healthy' });
  assert.deepEqual(profile, {
    ...emptyProfile,
    displayName: 'Abebe',
    consent: true,
    age: '34',
    goal: 'healthy',
  });
  assert.deepEqual(profile.preferences, []);
  assert.deepEqual(profile.healthContext, []);
  assert.equal(profile.lifeStage, '');
});

test('normalizeProfile drops unknown health, preference, goal, and life-stage values', () => {
  const profile = normalizeProfile({
    consent: true,
    healthContext: ['Diabetes', 'Cancer', 'Diabetes', 42 as unknown as string],
    preferences: ['Vegetarian', 'Keto'],
    goal: 'cure-diabetes' as never,
    lifeStage: 'menopause' as never,
    age: 30 as unknown as string,
  });
  assert.deepEqual(profile.healthContext, ['Diabetes']);
  assert.deepEqual(profile.preferences, ['Vegetarian']);
  assert.equal(profile.goal, '');
  assert.equal(profile.lifeStage, '');
  assert.equal(profile.age, '');
});

test('normalizeProfile survives missing or broken stored values', () => {
  assert.deepEqual(normalizeProfile(null), emptyProfile);
  assert.deepEqual(normalizeProfile(undefined), emptyProfile);
  assert.deepEqual(normalizeProfile({ preferences: 'Vegetarian' as unknown as string[] }).preferences, []);
});

test('validateProfile rejects an unknown health note while consent is on', () => {
  const { profile } = validateProfile({
    ...emptyProfile,
    consent: true,
    healthContext: ['Blood pressure', 'Thyroid'],
    preferences: ['High protein', 'Paleo'],
  });
  assert.deepEqual(profile.healthContext, ['Blood pressure']);
  assert.deepEqual(profile.preferences, ['High protein']);
});

test('a legacy weight goal keeps its value and stays selectable', () => {
  const normalized = normalizeProfile({ consent: true, goal: 'weight' });
  assert.equal(normalized.goal, 'weight');

  const { profile } = validateProfile({ ...emptyProfile, consent: true, goal: 'weight' });
  assert.equal(profile.goal, 'weight');

  const legacyOptions = goalOptions('weight');
  assert.ok(legacyOptions.some((option) => option.id === 'weight'));
  assert.ok(!goalOptions('healthy').some((option) => option.id === 'weight'));
});

test('toggling several values in sequence keeps every selection', () => {
  let selected: string[] = [];
  selected = toggleValue(selected, 'Diabetes');
  selected = toggleValue(selected, 'Blood pressure');
  assert.deepEqual(selected, ['Diabetes', 'Blood pressure']);

  selected = toggleValue(selected, 'Diabetes');
  assert.deepEqual(selected, ['Blood pressure']);
});
