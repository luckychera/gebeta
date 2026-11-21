import type { LifeStage, ProfileGoal } from '../types';

export const PREFERENCE_OPTIONS = ['Vegetarian', 'High protein', 'Mild spice', 'No raw meat'] as const;

export const GENDERS = ['Woman', 'Man', 'Another', 'Prefer not to say'] as const;

export const ACTIVITIES = ['Mostly seated', 'On your feet', 'Regular training', 'Prefer not to say'] as const;

export const LIFE_STAGES: { id: LifeStage; label: string }[] = [
  { id: '', label: 'Not now' },
  { id: 'pregnant', label: 'Pregnant' },
  { id: 'breastfeeding', label: 'Breastfeeding' },
];

export const HEALTH_CONTEXT = ['Diabetes', 'Blood pressure'] as const;

export const GOALS: { id: Exclude<ProfileGoal, ''>; label: string }[] = [
  { id: 'healthy', label: 'General healthy eating' },
  { id: 'maintain', label: 'Maintain weight' },
  { id: 'lose', label: 'Lose weight' },
  { id: 'gain', label: 'Gain weight' },
];

const LEGACY_GOAL = { id: 'weight' as const, label: 'Weight management (saved earlier)' };

export function goalOptions(current: ProfileGoal): { id: Exclude<ProfileGoal, ''>; label: string }[] {
  return current === LEGACY_GOAL.id ? [...GOALS, LEGACY_GOAL] : GOALS;
}

export const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'traditional', label: 'Traditional Foods' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'high-protein', label: 'High Protein' },
] as const;

export type FilterId = (typeof FILTERS)[number]['id'];
