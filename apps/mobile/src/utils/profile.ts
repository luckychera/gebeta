import { HEALTH_CONTEXT, PREFERENCE_OPTIONS } from '../data/options';
import type { LifeStage, Profile, ProfileGoal } from '../types';

export const emptyProfile: Profile = {
  displayName: '',
  consent: false,
  age: '',
  gender: '',
  activity: '',
  lifeStage: '',
  preferences: [],
  allergies: '',
  healthContext: [],
  goal: '',
  energyReference: '',
};

const GOALS: ProfileGoal[] = ['', 'maintain', 'weight', 'lose', 'gain', 'healthy'];
const LIFE_STAGES: LifeStage[] = ['', 'pregnant', 'breastfeeding'];

const ALLOWED_HEALTH_CONTEXT: string[] = [...HEALTH_CONTEXT];
const ALLOWED_PREFERENCES: string[] = [...PREFERENCE_OPTIONS];

function keepAllowed(input: unknown, allowed: string[]): string[] {
  if (!Array.isArray(input)) return [];
  const kept: string[] = [];
  for (const item of input) {
    if (typeof item === 'string' && allowed.includes(item) && !kept.includes(item)) kept.push(item);
  }
  return kept;
}

export function sanitizeHealthContext(input: unknown): string[] {
  return keepAllowed(input, ALLOWED_HEALTH_CONTEXT);
}

export function sanitizePreferences(input: unknown): string[] {
  return keepAllowed(input, ALLOWED_PREFERENCES);
}

export function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function normalizeProfile(input: Partial<Profile> | null | undefined): Profile {
  const goal = GOALS.includes(input?.goal as ProfileGoal) ? (input?.goal as ProfileGoal) : '';
  const lifeStage = LIFE_STAGES.includes(input?.lifeStage as LifeStage) ? (input?.lifeStage as LifeStage) : '';
  return {
    displayName: text(input?.displayName),
    consent: Boolean(input?.consent),
    age: text(input?.age),
    gender: text(input?.gender),
    activity: text(input?.activity),
    lifeStage,
    preferences: sanitizePreferences(input?.preferences),
    allergies: text(input?.allergies),
    healthContext: sanitizeHealthContext(input?.healthContext),
    goal,
    energyReference: text(input?.energyReference),
  };
}

export function energyReferenceValue(profile: Profile): number | null {
  if (!profile.consent || !profile.energyReference.trim()) return null;
  const value = Number(profile.energyReference);
  if (!Number.isFinite(value) || value < 800 || value > 6000) return null;
  return value;
}

export function validateProfile(input: Profile): { profile: Profile; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const profile: Profile = {
    ...input,
    displayName: input.displayName.trim().slice(0, 40),
    allergies: input.allergies.trim().slice(0, 160),
    preferences: sanitizePreferences(input.preferences),
    healthContext: sanitizeHealthContext(input.healthContext),
    goal: GOALS.includes(input.goal) ? input.goal : '',
    lifeStage: LIFE_STAGES.includes(input.lifeStage) ? input.lifeStage : '',
  };

  if (!profile.consent) {
    return {
      profile: {
        ...profile,
        age: '',
        gender: '',
        activity: '',
        lifeStage: '',
        preferences: [],
        allergies: '',
        healthContext: [],
        goal: '',
        energyReference: '',
      },
      errors,
    };
  }

  if (profile.age.trim()) {
    const age = Number(profile.age);
    if (!Number.isInteger(age) || age < 1 || age > 120) {
      errors.age = 'Enter a whole number of years, or leave age empty.';
    } else if (age < 18) {
      errors.age = 'This demo does not keep nutrition profiles for anyone under 18.';
    }
  }

  if (profile.energyReference.trim()) {
    const energy = Number(profile.energyReference);
    if (!Number.isFinite(energy) || energy < 800 || energy > 6000) {
      errors.energyReference = 'Enter a reference between 800 and 6000 kcal, or leave it empty.';
    }
  }

  return { profile, errors };
}
