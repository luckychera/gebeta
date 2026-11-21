import assert from 'node:assert/strict';
import test from 'node:test';
import { recognizeDemo } from './recognition';

test('a chosen sample stays the first candidate and is labelled as a demo', () => {
  const result = recognizeDemo({ sampleFoodId: 'shiro' });
  assert.equal(result.provider, 'mock');
  assert.equal(result.isDemo, true);
  assert.equal(result.candidates[0]?.foodId, 'shiro');
  assert.match(result.notice, /no ai model/i);
});

test('the same photo reference returns the same demo match', () => {
  const first = recognizeDemo({ imageUri: 'file://plate-a.jpg' });
  const second = recognizeDemo({ imageUri: 'file://plate-a.jpg' });
  assert.equal(first.candidates[0]?.foodId, second.candidates[0]?.foodId);
  assert.equal(first.candidates[0]?.demoScore, second.candidates[0]?.demoScore);
});
