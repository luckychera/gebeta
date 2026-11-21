import assert from 'node:assert/strict';
import test from 'node:test';
import { FOODS } from '../data/foods';
import { recognizeDemo } from './recognition';

test('a chosen sample stays the first candidate and is labelled as a demo', () => {
  const result = recognizeDemo({ foods: FOODS, sampleFoodId: 'shiro' });

  assert.equal(result.provider, 'demo-fallback');
  assert.equal(result.isDemo, true);
  assert.equal(result.model, null);
  assert.equal(result.candidates[0]?.foodId, 'shiro');
  assert.match(result.notice, /no ai model/i);
});

test('the same photo reference returns the same demo match', () => {
  const first = recognizeDemo({ foods: FOODS, imageUri: 'file://plate-a.jpg' });
  const second = recognizeDemo({ foods: FOODS, imageUri: 'file://plate-a.jpg' });

  assert.equal(first.candidates[0]?.foodId, second.candidates[0]?.foodId);
});

test('the demo path never reports a confidence score', () => {
  const result = recognizeDemo({ foods: FOODS, imageUri: 'file://plate-b.jpg' });

  assert.ok(result.candidates.length > 0);
  assert.ok(result.candidates.every((candidate) => candidate.confidence === null));
  assert.match(result.scoreNote, /no confidence score/i);
});

test('the reason a real model was skipped is carried into the notice', () => {
  const result = recognizeDemo({
    foods: FOODS,
    imageUri: 'file://plate-c.jpg',
    reason: 'Sign in to use Gemini recognition.',
  });

  assert.match(result.notice, /sign in to use gemini/i);
});

test('an empty catalogue reports that nothing can be suggested', () => {
  const result = recognizeDemo({ foods: [], imageUri: 'file://plate-d.jpg' });

  assert.equal(result.status, 'unavailable');
  assert.equal(result.candidates.length, 0);
});
