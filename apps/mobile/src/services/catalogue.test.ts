import assert from 'node:assert/strict';
import test from 'node:test';
import { FOODS } from '../data/foods';
import { emptyProfile } from '../utils/profile';
import { allergyCaution, filterFoods, recommendFoods, searchFoods } from './catalogue';

test('search finds local names', () => {
  const found = searchFoods(FOODS, "ga'at");
  assert.deepEqual(
    found.map((food) => food.id),
    ['genfo'],
  );
});

test('breakfast filter returns breakfast dishes only', () => {
  const found = filterFoods(FOODS, 'breakfast');
  assert.ok(found.length > 0);
  assert.ok(found.every((food) => food.categories.includes('breakfast')));
});

test('vegetarian preference narrows recommendations', () => {
  const picks = recommendFoods({
    ...emptyProfile,
    consent: true,
    preferences: ['Vegetarian'],
  });
  assert.ok(picks.every((pick) => pick.food.categories.includes('vegetarian')));
  assert.match(picks[0]?.reason ?? '', /vegetarian/i);
});

test('allergy note matches a usual ingredient term', () => {
  const doro = FOODS.find((food) => food.id === 'doro-wot');
  assert.ok(doro);
  assert.match(allergyCaution(doro, 'egg', true) ?? '', /egg/i);
  assert.equal(allergyCaution(doro, 'egg', false), null);
});
