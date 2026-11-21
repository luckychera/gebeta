import type { DiaryEntry, FoodRecord, NutrientSet } from '../types';

export function scaleNutrient(value: number | null, portion: number): number | null {
  if (value == null || !Number.isFinite(portion)) return null;
  return Math.round(value * portion);
}

export function scaleNutrition(food: FoodRecord, portion: number): NutrientSet {
  return {
    energyKcal: scaleNutrient(food.nutrition.energyKcal, portion),
    proteinGrams: scaleNutrient(food.nutrition.proteinGrams, portion),
    carbohydrateGrams: scaleNutrient(food.nutrition.carbohydrateGrams, portion),
    fatGrams: scaleNutrient(food.nutrition.fatGrams, portion),
    fibreGrams: scaleNutrient(food.nutrition.fibreGrams, portion),
  };
}

export function sumDiary(
  entries: DiaryEntry[],
  key: keyof Pick<DiaryEntry, 'energyKcal' | 'proteinGrams' | 'carbohydrateGrams' | 'fatGrams' | 'fibreGrams'>,
): { total: number | null; missing: number } {
  let total = 0;
  let missing = 0;
  let any = false;
  for (const entry of entries) {
    const value = entry[key];
    if (value == null) {
      missing += 1;
    } else {
      total += value;
      any = true;
    }
  }
  return { total: any ? total : null, missing };
}
