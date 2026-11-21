// Pure translation between database rows and the application types.
//
// Two rules hold everywhere in this file:
//   * An unknown nutrient stays null. It never becomes 0.
//   * A value the database does not recognise is dropped, not guessed.

import { sanitizeHealthContext, sanitizePreferences } from '../../utils/profile';
import type {
  DiaryEntry,
  FoodCategory,
  FoodRecord,
  LifeStage,
  MenuItem,
  Profile,
  ProfileGoal,
  ProviderRecord,
} from '../../types';
import type {
  DiaryEntryWithFood,
  FoodItemRow,
  FoodNutritionRow,
  MenuItemInsert,
  ProfileRow,
  ProviderMenuItemRow,
  ProviderRow,
  UserPreferencesRow,
} from './database.types';

const CATEGORIES: FoodCategory[] = ['traditional', 'breakfast', 'lunch', 'dinner', 'vegetarian', 'high-protein'];
const GOALS: ProfileGoal[] = ['maintain', 'weight', 'lose', 'gain', 'healthy'];
const LIFE_STAGES: LifeStage[] = ['pregnant', 'breastfeeding'];

/** PostgREST sends numeric columns as JSON numbers, but a string is tolerated. */
export function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function categoryList(value: unknown): FoodCategory[] {
  return stringList(value).filter((item): item is FoodCategory => (CATEGORIES as string[]).includes(item));
}

export type FoodItemWithNutrition = FoodItemRow & {
  food_nutrition?: FoodNutritionRow[] | FoodNutritionRow | null;
};

export function foodFromRow(row: FoodItemWithNutrition): FoodRecord {
  const nutritionRows = Array.isArray(row.food_nutrition)
    ? row.food_nutrition
    : row.food_nutrition
      ? [row.food_nutrition]
      : [];
  const nutrition = nutritionRows[0] ?? null;

  return {
    id: row.slug,
    remoteId: row.id,
    name: row.name,
    localNames: stringList(row.local_names),
    description: row.description ?? '',
    categories: categoryList(row.categories),
    imageKey: row.image_key || 'hero',
    ingredients: stringList(row.ingredients),
    cautionTerms: stringList(row.caution_terms),
    oftenUncooked: Boolean(row.often_uncooked),
    servingBasis: nutrition?.serving_basis ?? 'Serving basis not recorded',
    servingGrams: numberOrNull(nutrition?.serving_grams),
    nutrition: {
      energyKcal: numberOrNull(nutrition?.energy_kcal),
      proteinGrams: numberOrNull(nutrition?.protein_g),
      carbohydrateGrams: numberOrNull(nutrition?.carbohydrate_g),
      fatGrams: numberOrNull(nutrition?.fat_g),
      fibreGrams: numberOrNull(nutrition?.fibre_g),
    },
    nutritionSource: nutrition?.source_label ?? 'No nutrition record is stored for this food yet.',
    verificationStatus: nutrition?.verification_status ?? 'illustrative-demo',
    assumptions: nutrition?.assumptions ?? '',
    dietaryNotes: stringList(row.dietary_notes),
  };
}

export function diaryEntryFromRow(row: DiaryEntryWithFood): DiaryEntry {
  const joined = Array.isArray(row.food_items) ? row.food_items[0] : row.food_items;

  return {
    id: row.id,
    foodId: joined?.slug ?? '',
    name: row.food_name,
    portion: numberOrNull(row.portion) ?? 1,
    servingBasis: row.serving_basis ?? '',
    energyKcal: numberOrNull(row.energy_kcal),
    proteinGrams: numberOrNull(row.protein_g),
    carbohydrateGrams: numberOrNull(row.carbohydrate_g),
    fatGrams: numberOrNull(row.fat_g),
    fibreGrams: numberOrNull(row.fibre_g),
    imageKey: row.image_key || 'hero',
    createdAt: row.eaten_at ?? row.created_at,
    sourceLabel: row.source_label ?? '',
  };
}

export type DiaryInsert = {
  user_id: string;
  food_id: string | null;
  food_name: string;
  portion: number;
  serving_basis: string;
  energy_kcal: number | null;
  protein_g: number | null;
  carbohydrate_g: number | null;
  fat_g: number | null;
  fibre_g: number | null;
  image_key: string;
  source_label: string;
  eaten_at: string;
};

export function diaryInsertFromEntry(entry: DiaryEntry, userId: string, foodUuid: string | null): DiaryInsert {
  return {
    user_id: userId,
    food_id: foodUuid,
    food_name: entry.name,
    portion: entry.portion,
    serving_basis: entry.servingBasis,
    energy_kcal: entry.energyKcal,
    protein_g: entry.proteinGrams,
    carbohydrate_g: entry.carbohydrateGrams,
    fat_g: entry.fatGrams,
    fibre_g: entry.fibreGrams,
    image_key: entry.imageKey,
    source_label: entry.sourceLabel,
    eaten_at: entry.createdAt,
  };
}

export function profileFromRows(
  profileRow: ProfileRow,
  preferencesRow: UserPreferencesRow | null | undefined,
): Profile {
  const consent = Boolean(profileRow.consent_health);
  const row = preferencesRow ?? null;

  const goal = row?.goal && (GOALS as string[]).includes(row.goal) ? (row.goal as ProfileGoal) : '';
  const lifeStage =
    row?.life_stage && (LIFE_STAGES as string[]).includes(row.life_stage) ? (row.life_stage as LifeStage) : '';

  return {
    displayName: profileRow.display_name ?? '',
    consent,
    age: consent && row?.age ? String(row.age) : '',
    gender: consent ? (row?.gender ?? '') : '',
    activity: consent ? (row?.activity ?? '') : '',
    lifeStage: consent ? lifeStage : '',
    preferences: consent ? sanitizePreferences(row?.preferences) : [],
    allergies: consent ? (row?.allergies ?? '') : '',
    healthContext: consent ? sanitizeHealthContext(row?.health_context) : [],
    goal: consent ? goal : '',
    energyReference: consent && row?.energy_reference_kcal ? String(row.energy_reference_kcal) : '',
  };
}

export type PreferencesUpsert = Omit<UserPreferencesRow, 'created_at' | 'updated_at'>;

/**
 * Builds the preferences row for a save. When consent is off every optional
 * field is written back as empty, so turning consent off really does erase
 * what was stored rather than just hiding it.
 */
export function preferencesUpsertFromProfile(profile: Profile, userId: string): PreferencesUpsert {
  if (!profile.consent) {
    return {
      user_id: userId,
      age: null,
      gender: null,
      activity: null,
      life_stage: null,
      preferences: [],
      allergies: '',
      health_context: [],
      goal: null,
      energy_reference_kcal: null,
    };
  }

  const age = Number.parseInt(profile.age, 10);
  const energy = Number.parseInt(profile.energyReference, 10);

  return {
    user_id: userId,
    age: Number.isFinite(age) ? age : null,
    gender: profile.gender || null,
    activity: profile.activity || null,
    life_stage: profile.lifeStage || null,
    preferences: sanitizePreferences(profile.preferences),
    allergies: profile.allergies ?? '',
    health_context: sanitizeHealthContext(profile.healthContext),
    goal: profile.goal || null,
    energy_reference_kcal: Number.isFinite(energy) ? energy : null,
  };
}

export function providerFromRow(row: ProviderRow, manageable: boolean): ProviderRecord {
  return {
    id: row.slug,
    remoteId: row.id,
    name: row.name,
    kind: row.kind === 'Hotel' || row.kind === 'Café' ? row.kind : 'Café',
    city: row.city ?? '',
    summary: row.summary ?? '',
    manageable,
  };
}

export function menuItemFromRow(row: ProviderMenuItemRow, foodSlug: string | null): MenuItem {
  return {
    id: row.id,
    foodId: foodSlug,
    name: row.name,
    description: row.description ?? '',
    priceEtb: numberOrNull(row.price_etb) ?? 0,
    ingredients: stringList(row.ingredients),
    published: Boolean(row.is_published),
  };
}

export function menuItemInsert(item: MenuItem, providerUuid: string, foodUuid: string | null): MenuItemInsert {
  return {
    provider_id: providerUuid,
    food_id: foodUuid,
    name: item.name,
    description: item.description,
    price_etb: item.priceEtb,
    ingredients: item.ingredients,
    is_published: item.published,
  };
}
