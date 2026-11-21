import type { MenuItem, ModerationState, ProviderRecord, ReviewState } from '../types';

export const PROVIDERS: ProviderRecord[] = [
  {
    id: 'kafa-terrace',
    name: 'Kafa Terrace Hotel',
    kind: 'Hotel',
    city: 'Bonga',
    summary:
      'A fictional hotel kitchen in Kafa, used to show a digital menu, sample prices, and a QR referral. Not a real partnership.',
    manageable: true,
    referralPath: 'gebeta://provider/kafa-terrace',
  },
  {
    id: 'jimma-lakes',
    name: 'Jimma Lakes Café',
    kind: 'Café',
    city: 'Jimma',
    summary:
      'A fictional café menu for the guest view. Guests can read it without an account. It is not a live listing.',
    manageable: false,
    referralPath: 'gebeta://provider/jimma-lakes',
  },
];

export function getProvider(id: string): ProviderRecord | undefined {
  return PROVIDERS.find((provider) => provider.id === id);
}

export function seedMenus(): Record<string, MenuItem[]> {
  return {
    'kafa-terrace': [
      {
        id: 'kafa-shiro',
        foodId: 'shiro',
        name: 'Shiro with injera',
        description: 'Chickpea stew with a piece of injera.',
        priceEtb: 280,
        ingredients: ['chickpea flour', 'onion', 'berbere', 'injera'],
        published: true,
      },
      {
        id: 'kafa-doro',
        foodId: 'doro-wot',
        name: 'Doro Wot',
        description: 'Chicken stew with a boiled egg, served with injera.',
        priceEtb: 540,
        ingredients: ['chicken', 'egg', 'berbere', 'injera'],
        published: true,
      },
      {
        id: 'kafa-gomen',
        foodId: 'gomen',
        name: 'Gomen',
        description: 'Cooked collard greens.',
        priceEtb: 190,
        ingredients: ['collard greens', 'onion', 'garlic'],
        published: true,
      },
      {
        id: 'kafa-kitfo',
        foodId: 'kitfo',
        name: 'Kitfo',
        description: 'Seasoned minced beef. Ask the kitchen about doneness.',
        priceEtb: 650,
        ingredients: ['beef', 'mitmita', 'spiced butter'],
        published: true,
      },
      {
        id: 'kafa-bulla',
        foodId: 'bulla',
        name: 'Bulla breakfast',
        description: 'Enset porridge with spiced butter. Unpublished until the kitchen turns it on.',
        priceEtb: 160,
        ingredients: ['enset flour', 'butter'],
        published: false,
      },
    ],
    'jimma-lakes': [
      {
        id: 'jimma-kocho',
        foodId: 'kocho',
        name: 'Kocho plate',
        description: 'Fermented enset bread with a vegetable side.',
        priceEtb: 220,
        ingredients: ['enset', 'greens'],
        published: true,
      },
      {
        id: 'jimma-genfo',
        foodId: 'genfo',
        name: 'Morning genfo',
        description: 'Barley porridge with spiced butter.',
        priceEtb: 150,
        ingredients: ['barley', 'spiced butter'],
        published: true,
      },
      {
        id: 'jimma-shiro',
        foodId: 'shiro',
        name: 'Injera and shiro',
        description: 'A small fasting-style plate.',
        priceEtb: 260,
        ingredients: ['injera', 'chickpea stew'],
        published: true,
      },
    ],
  };
}

export function initialReview(): ReviewState {
  return { status: 'pending', note: '' };
}

export function initialModeration(): ModerationState {
  return {
    providerStatus: 'pending',
    events: [
      {
        id: 'sample-open',
        text: 'Sample event: Kafa Terrace Hotel submitted a demo profile.',
        at: '2026-11-20T09:00:00.000Z',
      },
    ],
  };
}
