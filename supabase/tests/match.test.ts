// Catalogue matching used by the recognize-food edge function.
// Run from apps/mobile through `npm test`.

import assert from 'node:assert/strict';
import test from 'node:test';
import { matchCatalogue, normalize, type CatalogueEntry } from '../functions/recognize-food/match.ts';

const CATALOGUE: CatalogueEntry[] = [
  { slug: 'injera', name: 'Injera', localNames: ['injera'] },
  { slug: 'doro-wot', name: 'Doro Wot', localNames: ['doro wat', 'doro wet'] },
  { slug: 'gomen', name: 'Gomen', localNames: ["ye'abesha gomen", 'gomen'] },
  { slug: 'kitfo', name: 'Kitfo', localNames: ['kitfo'] },
];

test('normalization folds case, accents, and punctuation', () => {
  assert.equal(normalize("Ye'abesha Gomen"), 'yeabesha gomen');
  assert.equal(normalize('  DORO   WAT  '), 'doro wat');
  assert.equal(normalize('Café'), 'cafe');
});

test('an exact name or local name matches the catalogue slug', () => {
  assert.equal(matchCatalogue('Injera', CATALOGUE), 'injera');
  assert.equal(matchCatalogue('doro wat', CATALOGUE), 'doro-wot');
  assert.equal(matchCatalogue('Doro Wot', CATALOGUE), 'doro-wot');
});

test('a dish named with a side still matches the main dish', () => {
  assert.equal(matchCatalogue('Doro wot with injera', CATALOGUE), 'doro-wot');
});

test('a food outside the catalogue matches nothing', () => {
  assert.equal(matchCatalogue('Pad Thai', CATALOGUE), null);
  assert.equal(matchCatalogue('Tibs', CATALOGUE), null);
  assert.equal(matchCatalogue('', CATALOGUE), null);
});

test('a short fragment does not match everything', () => {
  assert.equal(matchCatalogue('do', CATALOGUE), null);
  assert.equal(matchCatalogue('a', CATALOGUE), null);
});
