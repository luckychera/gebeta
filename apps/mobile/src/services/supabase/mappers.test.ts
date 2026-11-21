import assert from 'node:assert/strict';
import test from 'node:test';
import type { Profile } from '../../types';
import {
  diaryEntryFromRow,
  diaryInsertFromEntry,
  foodFromRow,
  menuItemFromRow,
  numberOrNull,
  preferencesUpsertFromProfile,
  profileFromRows,
  providerFromRow,
} from './mappers';

const foodRow = {
  id: '11111111-1111-1111-1111-111111111111',
  slug: 'kitfo',
  name: 'Kitfo',
  local_names: ['kitfo'],
  description: 'Minced beef.',
  categories: ['traditional', 'high-protein', 'not-a-category'],
  image_key: 'kitfo',
  ingredients: ['minced beef'],
  caution_terms: ['beef'],
  dietary_notes: ['Often served uncooked.'],
  often_uncooked: true,
  is_published: true,
  is_demo: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

test('an unknown nutrient stays null and never becomes zero', () => {
  const food = foodFromRow({
    ...foodRow,
    food_nutrition: [
      {
        id: 'n1',
        food_id: foodRow.id,
        serving_basis: '1 serving, about 150 g',
        serving_grams: 150,
        energy_kcal: 390,
        protein_g: 23,
        carbohydrate_g: null,
        fat_g: 32,
        fibre_g: null,
        source_label: 'Illustrative demo estimate.',
        verification_status: 'illustrative-demo',
        assumptions: 'Assumes 150 g.',
      },
    ],
  });

  assert.equal(food.nutrition.carbohydrateGrams, null);
  assert.equal(food.nutrition.fibreGrams, null);
  assert.equal(food.nutrition.energyKcal, 390);
  assert.equal(food.servingGrams, 150);
});

test('the catalogue slug becomes the app id and the uuid is kept separately', () => {
  const food = foodFromRow({ ...foodRow, food_nutrition: [] });
  assert.equal(food.id, 'kitfo');
  assert.equal(food.remoteId, foodRow.id);
});

test('a category the application does not know is dropped', () => {
  const food = foodFromRow({ ...foodRow, food_nutrition: null });
  assert.deepEqual(food.categories, ['traditional', 'high-protein']);
});

test('a food with no nutrition row says so instead of showing zeros', () => {
  const food = foodFromRow({ ...foodRow, food_nutrition: null });
  assert.equal(food.nutrition.energyKcal, null);
  assert.match(food.nutritionSource, /No nutrition record/i);
});

test('numeric columns are read whether they arrive as numbers or strings', () => {
  assert.equal(numberOrNull('12.5'), 12.5);
  assert.equal(numberOrNull(12.5), 12.5);
  assert.equal(numberOrNull(null), null);
  assert.equal(numberOrNull(''), null);
  assert.equal(numberOrNull('not a number'), null);
  assert.equal(numberOrNull(0), 0);
});

test('a diary row keeps its snapshot and resolves the food slug from the join', () => {
  const entry = diaryEntryFromRow({
    id: 'd1',
    user_id: 'u1',
    food_id: foodRow.id,
    food_name: 'Kitfo',
    portion: '1.50',
    serving_basis: '1 serving',
    energy_kcal: '585',
    protein_g: null,
    carbohydrate_g: null,
    fat_g: null,
    fibre_g: null,
    image_key: 'kitfo',
    source_label: 'Illustrative demo estimate.',
    eaten_at: '2026-02-01T10:00:00Z',
    created_at: '2026-02-01T10:00:05Z',
    food_items: { slug: 'kitfo' },
  });

  assert.equal(entry.foodId, 'kitfo');
  assert.equal(entry.portion, 1.5);
  assert.equal(entry.energyKcal, 585);
  assert.equal(entry.proteinGrams, null);
  assert.equal(entry.createdAt, '2026-02-01T10:00:00Z');
});

test('a diary insert carries the owner and the resolved food uuid', () => {
  const payload = diaryInsertFromEntry(
    {
      id: 'local-1',
      foodId: 'kitfo',
      name: 'Kitfo',
      portion: 1,
      servingBasis: '1 serving',
      energyKcal: 390,
      proteinGrams: 23,
      carbohydrateGrams: null,
      fatGrams: 32,
      fibreGrams: null,
      imageKey: 'kitfo',
      createdAt: '2026-02-01T10:00:00Z',
      sourceLabel: 'Illustrative demo estimate.',
    },
    'user-1',
    foodRow.id,
  );

  assert.equal(payload.user_id, 'user-1');
  assert.equal(payload.food_id, foodRow.id);
  assert.equal(payload.carbohydrate_g, null);
});

const profileRow = {
  id: 'user-1',
  display_name: 'Alem',
  consent_health: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

test('health context is read only when consent is on', () => {
  const preferences = {
    user_id: 'user-1',
    age: 30,
    gender: 'Woman',
    activity: 'On your feet',
    life_stage: 'pregnant',
    preferences: ['Vegetarian'],
    allergies: 'peanut',
    health_context: ['Diabetes'],
    goal: 'lose',
    energy_reference_kcal: 2000,
  };

  const withConsent = profileFromRows(profileRow, preferences);
  assert.deepEqual(withConsent.healthContext, ['Diabetes']);
  assert.equal(withConsent.age, '30');
  assert.equal(withConsent.lifeStage, 'pregnant');

  const withoutConsent = profileFromRows({ ...profileRow, consent_health: false }, preferences);
  assert.deepEqual(withoutConsent.healthContext, []);
  assert.equal(withoutConsent.age, '');
  assert.equal(withoutConsent.lifeStage, '');
  assert.equal(withoutConsent.displayName, 'Alem');
});

test('values the application does not recognise are dropped when reading a profile', () => {
  const profile = profileFromRows(profileRow, {
    user_id: 'user-1',
    age: null,
    gender: null,
    activity: null,
    life_stage: 'retired',
    preferences: ['Vegetarian', 'Keto'],
    allergies: '',
    health_context: ['Diabetes', 'Nonsense'],
    goal: 'bulk',
    energy_reference_kcal: null,
  });

  assert.equal(profile.lifeStage, '');
  assert.deepEqual(profile.preferences, ['Vegetarian']);
  assert.deepEqual(profile.healthContext, ['Diabetes']);
  assert.equal(profile.goal, '');
});

test('turning consent off writes the optional fields back as empty', () => {
  const profile: Profile = {
    displayName: 'Alem',
    consent: false,
    age: '30',
    gender: 'Woman',
    activity: 'On your feet',
    lifeStage: 'pregnant',
    preferences: ['Vegetarian'],
    allergies: 'peanut',
    healthContext: ['Diabetes'],
    goal: 'lose',
    energyReference: '2000',
  };

  const payload = preferencesUpsertFromProfile(profile, 'user-1');

  assert.equal(payload.age, null);
  assert.equal(payload.gender, null);
  assert.equal(payload.life_stage, null);
  assert.deepEqual(payload.preferences, []);
  assert.equal(payload.allergies, '');
  assert.deepEqual(payload.health_context, []);
  assert.equal(payload.goal, null);
  assert.equal(payload.energy_reference_kcal, null);
});

test('a saved profile keeps only allowed values and sends empty strings as null', () => {
  const payload = preferencesUpsertFromProfile(
    {
      displayName: 'Alem',
      consent: true,
      age: 'not a number',
      gender: '',
      activity: '',
      lifeStage: '',
      preferences: ['Vegetarian', 'Keto'],
      allergies: 'peanut',
      healthContext: ['Blood pressure', 'Nonsense'],
      goal: '',
      energyReference: '',
    },
    'user-1',
  );

  assert.equal(payload.age, null);
  assert.equal(payload.gender, null);
  assert.equal(payload.life_stage, null);
  assert.equal(payload.goal, null);
  assert.deepEqual(payload.preferences, ['Vegetarian']);
  assert.deepEqual(payload.health_context, ['Blood pressure']);
});

test('provider manageability comes from membership, not from the row itself', () => {
  const row = {
    id: 'p1',
    slug: 'kafa-terrace',
    name: 'Kafa Terrace Hotel',
    kind: 'Hotel' as const,
    city: 'Bonga',
    summary: 'Fictional.',
    is_demo: true,
    is_published: true,
    moderation_status: 'pending' as const,
    owner_id: null,
  };

  assert.equal(providerFromRow(row, false).manageable, false);
  assert.equal(providerFromRow(row, true).manageable, true);
  assert.equal(providerFromRow(row, true).id, 'kafa-terrace');
  assert.equal(providerFromRow(row, true).remoteId, 'p1');
});

test('a menu item keeps the linked catalogue slug when there is one', () => {
  const row = {
    id: 'm1',
    provider_id: 'p1',
    food_id: foodRow.id,
    name: 'Kitfo',
    description: 'Seasoned minced beef.',
    price_etb: '650.00',
    currency: 'ETB',
    ingredients: ['beef'],
    is_published: true,
    sort_order: 1,
  };

  assert.equal(menuItemFromRow(row, 'kitfo').foodId, 'kitfo');
  assert.equal(menuItemFromRow(row, 'kitfo').priceEtb, 650);
  assert.equal(menuItemFromRow(row, null).foodId, null);
});
