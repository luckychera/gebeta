import type { ProfileGoal } from '../types';

export const PREFERENCE_OPTIONS = ['Vegetarian', 'High protein', 'Mild spice', 'No raw meat'] as const;

export const GENDERS = ['Woman', 'Man', 'Another', 'Prefer not to say'] as const;

export const ACTIVITIES = ['Mostly seated', 'On your feet', 'Regular training', 'Prefer not to say'] as const;

export const GOALS: { id: Exclude<ProfileGoal, ''>; label: string }[] = [
  { id: 'maintain', label: 'Maintain weight' },
  { id: 'weight', label: 'Weight management' },
  { id: 'healthy', label: 'General healthy eating' },
];

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
