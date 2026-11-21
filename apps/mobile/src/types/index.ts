export type FoodCategory =
  | 'traditional'
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'vegetarian'
  | 'high-protein';

export type NutrientSet = {
  energyKcal: number | null;
  proteinGrams: number | null;
  carbohydrateGrams: number | null;
  fatGrams: number | null;
  fibreGrams: number | null;
};

export type FoodRecord = {
  id: string;
  name: string;
  localNames: string[];
  description: string;
  categories: FoodCategory[];
  imageKey: string;
  ingredients: string[];
  cautionTerms: string[];
  oftenUncooked: boolean;
  servingBasis: string;
  servingGrams: number | null;
  nutrition: NutrientSet;
  nutritionSource: string;
  verificationStatus: 'illustrative-demo';
  assumptions: string;
  dietaryNotes: string[];
};

export type ProfileGoal = '' | 'maintain' | 'weight' | 'healthy';

export type Profile = {
  displayName: string;
  consent: boolean;
  age: string;
  gender: string;
  activity: string;
  preferences: string[];
  allergies: string;
  goal: ProfileGoal;
  energyReference: string;
};

export type DiaryEntry = {
  id: string;
  foodId: string;
  name: string;
  portion: number;
  servingBasis: string;
  energyKcal: number | null;
  proteinGrams: number | null;
  carbohydrateGrams: number | null;
  fatGrams: number | null;
  fibreGrams: number | null;
  imageKey: string;
  createdAt: string;
  sourceLabel: string;
};

export type MenuItem = {
  id: string;
  foodId: string | null;
  name: string;
  description: string;
  priceEtb: number;
  ingredients: string[];
  published: boolean;
};

export type ProviderRecord = {
  id: string;
  name: string;
  kind: 'Hotel' | 'Café';
  city: string;
  summary: string;
  manageable: boolean;
  referralPath: string;
};

export type ReviewStatus = 'pending' | 'approved' | 'changes';

export type ReviewState = {
  status: ReviewStatus;
  note: string;
};

export type ProviderModerationStatus = 'pending' | 'verified-demo' | 'needs-changes';

export type ActivityEvent = {
  id: string;
  text: string;
  at: string;
};

export type ModerationState = {
  providerStatus: ProviderModerationStatus;
  events: ActivityEvent[];
};

export type RecognitionCandidate = {
  foodId: string;
  label: string;
  demoScore: number;
};

export type RecognitionResult = {
  provider: 'mock';
  status: 'matched';
  isDemo: true;
  notice: string;
  scoreNote: string;
  candidates: RecognitionCandidate[];
};

export type ScanOrigin = 'camera' | 'library' | 'sample';

export type ScanSession = RecognitionResult & {
  imageUri: string | null;
  origin: ScanOrigin;
};
