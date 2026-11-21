import { FOODS } from '../data/foods';
import type { RecognitionResult } from '../types';

const NOTICE =
  'Demo recognition. No AI model analyzed this image. Suggestions come from the local Gebeta catalogue.';

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function roundScore(value: number): number {
  return Math.round(value * 100) / 100;
}

export function recognizeDemo(input: { sampleFoodId?: string; imageUri?: string | null }): RecognitionResult {
  let topIndex = 0;
  let topScore = 0.62;
  let scoreNote = 'Demo match score. It is not a probability from a recognition model.';

  if (input.sampleFoodId) {
    const found = FOODS.findIndex((food) => food.id === input.sampleFoodId);
    if (found >= 0) {
      topIndex = found;
      topScore = 0.86;
      scoreNote = 'Demo match score for a sample you chose. No model looked at an image.';
    }
  } else if (input.imageUri) {
    const hash = hashString(input.imageUri);
    topIndex = hash % FOODS.length;
    topScore = roundScore(0.58 + (hash % 17) / 100);
    scoreNote =
      'Demo match score derived from the image reference so the result stays repeatable. No AI model analyzed the photo.';
  }

  const top = FOODS[topIndex];
  const alt = FOODS[(topIndex + 1) % FOODS.length];
  const third = FOODS[(topIndex + 2) % FOODS.length];
  if (!top || !alt || !third) {
    throw new Error('Demo catalogue is empty.');
  }

  return {
    provider: 'mock',
    status: 'matched',
    isDemo: true,
    notice: NOTICE,
    scoreNote,
    candidates: [
      { foodId: top.id, label: top.name, demoScore: topScore },
      { foodId: alt.id, label: alt.name, demoScore: roundScore(topScore * 0.62) },
      { foodId: third.id, label: third.name, demoScore: roundScore(topScore * 0.41) },
    ],
  };
}
