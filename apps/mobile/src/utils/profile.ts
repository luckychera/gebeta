import type { Profile, ProfileGoal } from '../types';

export const emptyProfile: Profile = {
  displayName: '',
  consent: false,
  age: '',
  gender: '',
  activity: '',
  preferences: [],
  allergies: '',
  goal: '',
  energyReference: '',
};

const GOALS: ProfileGoal[] = ['', 'maintain', 'weight', 'healthy'];

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
    goal: GOALS.includes(input.goal) ? input.goal : '',
  };

  if (!profile.consent) {
    return {
      profile: {
        ...profile,
        age: '',
        gender: '',
        activity: '',
        preferences: [],
        allergies: '',
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
