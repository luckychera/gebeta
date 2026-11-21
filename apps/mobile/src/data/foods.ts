import type { FoodRecord } from '../types';

export const NUTRITION_SOURCE =
  'Illustrative demo estimate for teaching. Not a laboratory measurement and not institution-verified.';

export const NUTRITION_DISCLAIMER =
  'Nutrition values are estimates and may vary depending on ingredients, preparation and serving size.';

export const IMAGE_LIMIT =
  'A photo cannot show exact ingredients, cooking oil, recipe ratios, allergens, or portion weight.';

export const INGREDIENT_NOTE =
  'Often used in this dish. This list is not a reading of a specific plate.';

const base = {
  nutritionSource: NUTRITION_SOURCE,
  verificationStatus: 'illustrative-demo' as const,
};

export const FOODS: FoodRecord[] = [
  {
    ...base,
    id: 'injera',
    name: 'Injera',
    localNames: ['injera'],
    description:
      'A spongy fermented flatbread, often made with teff, that works as both plate and utensil.',
    categories: ['traditional', 'lunch', 'dinner', 'vegetarian'],
    imageKey: 'injera',
    ingredients: ['teff flour', 'water'],
    cautionTerms: ['teff', 'wheat', 'gluten'],
    oftenUncooked: false,
    servingBasis: '1 medium piece, about 150 g',
    servingGrams: 150,
    nutrition: { energyKcal: 230, proteinGrams: 7, carbohydrateGrams: 46, fatGrams: 2, fibreGrams: 5 },
    assumptions:
      'Assumes a teff piece of about 150 g. Some injera includes other grains. The illustrative figures are for the bread alone.',
    dietaryNotes: ['Usually plant-based. Confirm the grain mix if gluten matters.'],
  },
  {
    ...base,
    id: 'shiro',
    name: 'Shiro',
    localNames: ['shiro wot', 'shiro wet'],
    description:
      'A thick stew of powdered chickpeas or broad beans, simmered with onion, oil, and spices, and eaten with injera.',
    categories: ['traditional', 'lunch', 'dinner', 'vegetarian'],
    imageKey: 'shiro',
    ingredients: ['chickpea or broad-bean flour', 'onion', 'oil', 'berbere or mitmita'],
    cautionTerms: ['chickpea', 'bean', 'legume', 'shiro'],
    oftenUncooked: false,
    servingBasis: '1 ladle, about 180 g, without injera',
    servingGrams: 180,
    nutrition: { energyKcal: 290, proteinGrams: 12, carbohydrateGrams: 26, fatGrams: 14, fibreGrams: 7 },
    assumptions:
      'Assumes a household-style ladle and a modest amount of oil. Oil quantity changes the fat figure and cannot be seen from a photo.',
    dietaryNotes: ['Usual preparations are vegetarian. Confirm the fat used.'],
  },
  {
    ...base,
    id: 'doro-wot',
    name: 'Doro Wot',
    localNames: ['doro wat', 'doro wet'],
    description:
      'A slow-cooked chicken stew with berbere, often served with a boiled egg. Recipes differ by home and restaurant.',
    categories: ['traditional', 'lunch', 'dinner', 'high-protein'],
    imageKey: 'doro',
    ingredients: ['chicken', 'egg', 'onion', 'berbere', 'niter kibbeh or oil'],
    cautionTerms: ['chicken', 'egg', 'berbere'],
    oftenUncooked: false,
    servingBasis: '1 serving with one egg, about 250 g, without injera',
    servingGrams: 250,
    nutrition: { energyKcal: 410, proteinGrams: 29, carbohydrateGrams: 10, fatGrams: 28, fibreGrams: 2 },
    assumptions:
      'Assumes chicken plus one egg and a typical amount of spiced fat. The split between meat, egg, and fat is not visible in a photo.',
    dietaryNotes: ['Contains poultry and egg in the usual version shown here.'],
  },
  {
    ...base,
    id: 'kitfo',
    name: 'Kitfo',
    localNames: ['kitfo'],
    description:
      'Minced beef seasoned with mitmita and spiced butter. It is often served lightly cooked or uncooked. Doneness cannot be judged from the demo.',
    categories: ['traditional', 'dinner', 'high-protein'],
    imageKey: 'kitfo',
    ingredients: ['minced beef', 'mitmita', 'niter kibbeh'],
    cautionTerms: ['beef', 'meat', 'butter', 'dairy'],
    oftenUncooked: true,
    servingBasis: '1 serving of minced beef, about 150 g, without injera or ayib',
    servingGrams: 150,
    nutrition: {
      energyKcal: 390,
      proteinGrams: 23,
      carbohydrateGrams: null,
      fatGrams: 32,
      fibreGrams: null,
    },
    assumptions:
      'Assumes seasoned minced beef of about 150 g. Carbohydrate and fibre are not estimated because bread, cheese, and greens are often served beside it and are not part of this basis.',
    dietaryNotes: ['Often served uncooked or lightly cooked. Ask how it was prepared.'],
  },
  {
    ...base,
    id: 'kocho',
    name: 'Kocho',
    localNames: ['qocho', 'kocho'],
    description:
      'Fermented enset bread, widely eaten in southwestern Ethiopia. Sides change from place to place.',
    categories: ['traditional', 'lunch', 'dinner'],
    imageKey: 'kocho',
    ingredients: ['fermented enset'],
    cautionTerms: ['enset', 'kocho'],
    oftenUncooked: false,
    servingBasis: '1 piece, about 120 g',
    servingGrams: 120,
    nutrition: { energyKcal: 200, proteinGrams: 2, carbohydrateGrams: 47, fatGrams: 1, fibreGrams: 3 },
    assumptions:
      'Assumes plain fermented enset bread of about 120 g, without butter or a side stew.',
    dietaryNotes: ['The bread itself is plant-based. Sides may not be.'],
  },
  {
    ...base,
    id: 'gomen',
    name: 'Gomen',
    localNames: ["ye'abesha gomen", 'gomen'],
    description:
      'Collard greens cooked with onion, garlic, and spices. A common vegetable beside injera.',
    categories: ['traditional', 'lunch', 'dinner', 'vegetarian'],
    imageKey: 'gomen',
    ingredients: ['collard greens', 'onion', 'garlic', 'oil'],
    cautionTerms: ['collard', 'greens', 'gomen'],
    oftenUncooked: false,
    servingBasis: '1 serving of greens, about 150 g',
    servingGrams: 150,
    nutrition: { energyKcal: 150, proteinGrams: 4, carbohydrateGrams: 9, fatGrams: 10, fibreGrams: 4 },
    assumptions:
      'Assumes greens cooked with a modest amount of oil. Some versions include meat; this record is the vegetable dish only. Oil amount is not visible from a photo.',
    dietaryNotes: ['Vegetable version. Confirm that no meat stock was used.'],
  },
  {
    ...base,
    id: 'bulla',
    name: 'Bulla',
    localNames: ['bulla'],
    description:
      'A smooth enset-flour porridge or dough, often finished with butter or spices. Eaten as breakfast or a snack.',
    categories: ['traditional', 'breakfast'],
    imageKey: 'bulla',
    ingredients: ['enset flour', 'water', 'butter'],
    cautionTerms: ['enset', 'butter', 'dairy', 'bulla'],
    oftenUncooked: false,
    servingBasis: '1 bowl, about 200 g',
    servingGrams: 200,
    nutrition: {
      energyKcal: 250,
      proteinGrams: 2,
      carbohydrateGrams: 46,
      fatGrams: 7,
      fibreGrams: null,
    },
    assumptions:
      'Assumes a bowl with a small amount of butter. Without butter the fat figure would be lower. Fibre is not estimated.',
    dietaryNotes: ['Plant base. The usual butter finish is a dairy ingredient.'],
  },
  {
    ...base,
    id: 'genfo',
    name: 'Genfo',
    localNames: ["ga'at", 'genfo'],
    description:
      'A thick barley or wheat porridge with a well of spiced butter or berbere. A familiar breakfast.',
    categories: ['traditional', 'breakfast'],
    imageKey: 'genfo',
    ingredients: ['barley or wheat flour', 'water', 'spiced butter', 'berbere'],
    cautionTerms: ['barley', 'wheat', 'gluten', 'butter', 'dairy'],
    oftenUncooked: false,
    servingBasis: '1 bowl, about 250 g',
    servingGrams: 250,
    nutrition: { energyKcal: 360, proteinGrams: 8, carbohydrateGrams: 54, fatGrams: 12, fibreGrams: 4 },
    assumptions:
      'Assumes a barley-style bowl with a well of spiced butter. The grain and the amount of butter both change the estimate.',
    dietaryNotes: ['Usually contains gluten grains and butter.'],
  },
];

export function getFood(id: string): FoodRecord | undefined {
  return FOODS.find((food) => food.id === id);
}
