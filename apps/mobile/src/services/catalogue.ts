import type { FilterId } from '../data/options';
import type { FoodRecord, Profile } from '../types';

export type Recommendation = {
  food: FoodRecord;
  reason: string;
};

export function filterFoods(foods: FoodRecord[], filter: FilterId): FoodRecord[] {
  if (filter === 'all') return foods;
  return foods.filter((food) => food.categories.includes(filter));
}

export function searchFoods(foods: FoodRecord[], query: string): FoodRecord[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return foods;
  return foods.filter((food) => {
    const haystack = [food.name, food.description, ...food.localNames, ...food.ingredients, ...food.categories]
      .join(' ')
      .toLowerCase();
    return haystack.includes(needle);
  });
}

export function similarFoods(foods: FoodRecord[], foodId: string, limit = 3): FoodRecord[] {
  const current = foods.find((food) => food.id === foodId);
  if (!current) return [];
  return foods
    .filter((food) => food.id !== foodId && food.categories.some((category) => current.categories.includes(category)))
    .slice(0, limit);
}

export function allergyCaution(food: FoodRecord, allergies: string, consent: boolean): string | null {
  if (!consent) return null;
  const note = allergies.trim().toLowerCase();
  if (!note) return null;
  const hit = food.cautionTerms.find((term) => note.includes(term.toLowerCase()));
  if (!hit) return null;
  return `Your allergy note mentions “${hit}”. This dish often includes related ingredients. A photo cannot confirm this plate. Check with the cook or provider.`;
}

export function recommendFoods(foods: FoodRecord[], profile: Profile): Recommendation[] {
  if (!profile.consent) {
    return foods.slice(0, 3).map((food) => ({
      food,
      reason: 'Featured in the catalogue. Not a personal health prescription.',
    }));
  }

  let pool = [...foods];
  const because: string[] = [];

  if (profile.preferences.includes('Vegetarian')) {
    pool = pool.filter((food) => food.categories.includes('vegetarian'));
    because.push('your vegetarian preference');
  }
  if (profile.preferences.includes('No raw meat')) {
    pool = pool.filter((food) => !food.oftenUncooked);
    because.push('your preference to skip foods often served uncooked');
  }
  if (profile.preferences.includes('High protein')) {
    const higher = pool.filter((food) => food.categories.includes('high-protein'));
    if (higher.length > 0) {
      pool = higher;
      because.push('your higher-protein preference');
    } else {
      because.push('your higher-protein preference could not be matched in the remaining dishes');
    }
  }
  if (pool.length === 0) {
    pool = foods.filter((food) => food.categories.includes('vegetarian'));
  }

  const spice = profile.preferences.includes('Mild spice')
    ? ' Mild spice is saved, but this catalogue does not rate heat, so nothing was hidden for spice.'
    : '';
  const goal = profile.goal
    ? ' Your goal is saved as context. Gebeta does not rank these dishes for weight change or any other outcome.'
    : '';
  const life =
    profile.lifeStage === 'pregnant' || profile.lifeStage === 'breastfeeding'
      ? ' Pregnancy or breastfeeding is saved as context only. No dish here is checked for either.'
      : '';
  const health = (profile.healthContext ?? []).length
    ? ' A note about diabetes or blood pressure is personal context. It does not make a dish suitable for that condition.'
    : '';
  const reason = because.length
    ? `Shown because of ${because.join(' and ')}. This is dietary-preference filtering of the catalogue, not a prescribed diet.${spice}${goal}${life}${health}`
    : `Featured in the catalogue. Not a personal health prescription.${spice}${goal}${life}${health}`;

  return pool.slice(0, 3).map((food) => ({ food, reason }));
}
