import assert from 'node:assert/strict';
import test from 'node:test';
import { getFood } from '../data/foods';
import { scaleNutrition, sumDiary } from './nutrition';
import type { DiaryEntry } from '../types';

test('scales a serving and leaves unknown nutrients unknown', () => {
  const kitfo = getFood('kitfo');
  assert.ok(kitfo);
  const scaled = scaleNutrition(kitfo, 2);
  assert.equal(scaled.energyKcal, 780);
  assert.equal(scaled.proteinGrams, 46);
  assert.equal(scaled.carbohydrateGrams, null);
  assert.equal(scaled.fibreGrams, null);
});

test('rounds a half serving from the illustrative baseline', () => {
  const genfo = getFood('genfo');
  assert.ok(genfo);
  const scaled = scaleNutrition(genfo, 1.5);
  assert.equal(scaled.energyKcal, 540);
});

test('sums only known diary values', () => {
  const entries: DiaryEntry[] = [
    {
      id: 'a',
      foodId: 'shiro',
      name: 'Shiro',
      portion: 1,
      servingBasis: '1 ladle',
      energyKcal: 290,
      proteinGrams: 12,
      carbohydrateGrams: 26,
      fatGrams: 14,
      fibreGrams: null,
      imageKey: 'shiro',
      createdAt: '2026-11-21T08:00:00.000Z',
      sourceLabel: 'Illustrative',
    },
  ];
  assert.equal(sumDiary(entries, 'energyKcal').total, 290);
  assert.equal(sumDiary(entries, 'fibreGrams').total, null);
  assert.equal(sumDiary(entries, 'fibreGrams').missing, 1);
});
