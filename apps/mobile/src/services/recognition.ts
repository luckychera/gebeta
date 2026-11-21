import type { FoodRecord, RecognitionResult } from '../types';

export const DEMO_NOTICE =
  'Demo fallback. No AI model analyzed this image. The suggestions below are drawn from the local Gebeta catalogue so the journey can still be shown.';

const DEMO_SCORE_NOTE =
  'There is no confidence score here because no model ran. Pick the right dish yourself before saving anything.';

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

/**
 * The offline path. It never claims to have looked at the photo: the order is
 * derived from the image reference only so the same picture gives the same
 * list twice in a row during a demonstration.
 */
export function recognizeDemo(input: {
  foods: FoodRecord[];
  sampleFoodId?: string | undefined;
  imageUri?: string | null | undefined;
  reason?: string | undefined;
}): RecognitionResult {
  const foods = input.foods;

  if (foods.length === 0) {
    return {
      provider: 'demo-fallback',
      status: 'unavailable',
      isDemo: true,
      model: null,
      notice: 'No catalogue is loaded, so nothing can be suggested. Try again once the catalogue has loaded.',
      scoreNote: DEMO_SCORE_NOTE,
      candidates: [],
    };
  }

  let topIndex = 0;
  let explanation = 'First entry in the demo catalogue.';

  if (input.sampleFoodId) {
    const found = foods.findIndex((food) => food.id === input.sampleFoodId);
    if (found >= 0) {
      topIndex = found;
      explanation = 'This is the sample dish you picked, not a model result.';
    }
  } else if (input.imageUri) {
    topIndex = hashString(input.imageUri) % foods.length;
    explanation = 'Chosen from the image reference so the demo stays repeatable. No model saw the photo.';
  }

  const picks = [topIndex, (topIndex + 1) % foods.length, (topIndex + 2) % foods.length]
    .filter((value, index, list) => list.indexOf(value) === index)
    .map((index) => foods[index])
    .filter((food): food is FoodRecord => Boolean(food));

  return {
    provider: 'demo-fallback',
    status: 'matched',
    isDemo: true,
    model: null,
    notice: input.reason ? `${DEMO_NOTICE} ${input.reason}` : DEMO_NOTICE,
    scoreNote: DEMO_SCORE_NOTE,
    candidates: picks.map((food, position) => ({
      foodId: food.id,
      label: food.name,
      localName: food.localNames[0] ?? null,
      confidence: null,
      explanation: position === 0 ? explanation : 'Another catalogue dish offered so you can correct the first guess.',
    })),
  };
}
