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
  /** Catalogue slug. Used in deep links such as /food/injera. */
  id: string;
  /** Database UUID when the record came from Supabase, null for bundled data. */
  remoteId?: string | null;
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
  verificationStatus: 'illustrative-demo' | 'institution-reviewed';
  assumptions: string;
  dietaryNotes: string[];
};

export type ProfileGoal = '' | 'maintain' | 'weight' | 'lose' | 'gain' | 'healthy';

export type LifeStage = '' | 'pregnant' | 'breastfeeding';

export type Profile = {
  displayName: string;
  consent: boolean;
  age: string;
  gender: string;
  activity: string;
  lifeStage: LifeStage;
  preferences: string[];
  allergies: string;
  healthContext: string[];
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
  /** Provider slug. Used in the public link /provider/kafa-terrace. */
  id: string;
  remoteId?: string | null;
  name: string;
  kind: 'Hotel' | 'Café';
  city: string;
  summary: string;
  manageable: boolean;
};

export type ReviewStatus = 'pending' | 'approved' | 'changes' | 'rejected';

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
  /** Catalogue slug when the candidate matched a Gebeta food, otherwise null. */
  foodId: string | null;
  label: string;
  localName: string | null;
  /** Model-reported confidence in 0..1, or null when the model gave none. */
  confidence: number | null;
  explanation: string;
};

export type RecognitionProvider = 'gemini' | 'demo-fallback';

export type RecognitionStatus = 'matched' | 'no_match' | 'unavailable';

export type RecognitionResult = {
  provider: RecognitionProvider;
  status: RecognitionStatus;
  /** True when no AI model looked at the image. */
  isDemo: boolean;
  model: string | null;
  notice: string;
  scoreNote: string;
  candidates: RecognitionCandidate[];
};

export type ScanOrigin = 'camera' | 'library' | 'sample';

export type ScanSession = RecognitionResult & {
  imageUri: string | null;
  origin: ScanOrigin;
};
