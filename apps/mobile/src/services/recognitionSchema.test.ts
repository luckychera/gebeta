import assert from 'node:assert/strict';
import test from 'node:test';
import { parseRecognitionPayload } from './recognitionSchema';

const CATALOGUE = new Set(['injera', 'shiro', 'doro-wot', 'kitfo']);

test('a valid matched response becomes candidates the user can open', () => {
  const outcome = parseRecognitionPayload(
    {
      status: 'matched',
      model: 'gemini-2.5-flash',
      candidates: [
        { name: 'Doro Wot', localName: 'doro wat', confidence: 0.82, explanation: 'Dark stew with an egg.', foodSlug: 'doro-wot' },
        { name: 'Shiro', confidence: 0.3, foodSlug: 'shiro' },
      ],
    },
    CATALOGUE,
  );

  assert.equal(outcome.ok, true);
  if (!outcome.ok) return;
  assert.equal(outcome.result.status, 'matched');
  assert.equal(outcome.result.provider, 'gemini');
  assert.equal(outcome.result.isDemo, false);
  assert.equal(outcome.result.model, 'gemini-2.5-flash');
  assert.equal(outcome.result.candidates[0]?.foodId, 'doro-wot');
  assert.equal(outcome.result.candidates[0]?.confidence, 0.82);
});

test('a no-match response keeps the names but points at nothing in the catalogue', () => {
  const outcome = parseRecognitionPayload(
    { status: 'no_match', candidates: [{ name: 'Pad Thai', confidence: 0.6 }] },
    CATALOGUE,
  );

  assert.equal(outcome.ok, true);
  if (!outcome.ok) return;
  assert.equal(outcome.result.status, 'no_match');
  assert.equal(outcome.result.candidates[0]?.foodId, null);
  assert.match(outcome.result.notice, /nothing it suggested matches/i);
});

test('a claimed match with no catalogue food is downgraded to no_match', () => {
  const outcome = parseRecognitionPayload(
    { status: 'matched', candidates: [{ name: 'Tibs', confidence: 0.9, foodSlug: 'tibs' }] },
    CATALOGUE,
  );

  assert.equal(outcome.ok, true);
  if (!outcome.ok) return;
  assert.equal(outcome.result.status, 'no_match');
  assert.equal(outcome.result.candidates[0]?.foodId, null);
});

test('a food slug the catalogue does not contain is never trusted', () => {
  const outcome = parseRecognitionPayload(
    {
      status: 'matched',
      candidates: [
        { name: 'Injera', confidence: 0.9, foodSlug: 'injera' },
        { name: 'Invented', confidence: 0.4, foodSlug: '../../etc/passwd' },
      ],
    },
    CATALOGUE,
  );

  assert.equal(outcome.ok, true);
  if (!outcome.ok) return;
  assert.equal(outcome.result.candidates[1]?.foodId, null);
});

test('a confidence outside zero to one is dropped rather than clamped into a claim', () => {
  const outcome = parseRecognitionPayload(
    {
      status: 'matched',
      candidates: [
        { name: 'Injera', confidence: 42, foodSlug: 'injera' },
        { name: 'Shiro', confidence: 'high', foodSlug: 'shiro' },
      ],
    },
    CATALOGUE,
  );

  assert.equal(outcome.ok, true);
  if (!outcome.ok) return;
  assert.equal(outcome.result.candidates[0]?.confidence, null);
  assert.equal(outcome.result.candidates[1]?.confidence, null);
  assert.match(outcome.result.scoreNote, /did not return a confidence/i);
});

test('an unavailable response carries the reason and no candidates', () => {
  const outcome = parseRecognitionPayload(
    { status: 'unavailable', reason: 'Gemini has reached its quota for now.' },
    CATALOGUE,
  );

  assert.equal(outcome.ok, true);
  if (!outcome.ok) return;
  assert.equal(outcome.result.status, 'unavailable');
  assert.equal(outcome.result.candidates.length, 0);
  assert.match(outcome.result.notice, /quota/i);
});

test('an unparseable payload is refused instead of being shown', () => {
  assert.equal(parseRecognitionPayload(null, CATALOGUE).ok, false);
  assert.equal(parseRecognitionPayload('matched', CATALOGUE).ok, false);
  assert.equal(parseRecognitionPayload({ status: 'great' }, CATALOGUE).ok, false);
  assert.equal(parseRecognitionPayload({}, CATALOGUE).ok, false);
});

test('nutrition invented by the model is never carried through', () => {
  const outcome = parseRecognitionPayload(
    {
      status: 'matched',
      candidates: [{ name: 'Injera', confidence: 0.8, foodSlug: 'injera', energyKcal: 999, protein: 50 }],
    },
    CATALOGUE,
  );

  assert.equal(outcome.ok, true);
  if (!outcome.ok) return;
  assert.deepEqual(Object.keys(outcome.result.candidates[0] ?? {}).sort(), [
    'confidence',
    'explanation',
    'foodId',
    'label',
    'localName',
  ]);
});

test('a long candidate list is capped and nameless entries are dropped', () => {
  const outcome = parseRecognitionPayload(
    {
      status: 'no_match',
      candidates: [
        { name: '' },
        { confidence: 0.1 },
        { name: 'a' },
        { name: 'b' },
        { name: 'c' },
        { name: 'd' },
        { name: 'e' },
      ],
    },
    CATALOGUE,
  );

  assert.equal(outcome.ok, true);
  if (!outcome.ok) return;
  assert.equal(outcome.result.candidates.length, 3);
});
