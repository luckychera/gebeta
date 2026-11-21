import type { Profile } from '../../../types';
import type { GebetaClient } from '../client';
import type { ProfileRow, UserPreferencesRow, UserRoleRow } from '../database.types';
import { preferencesUpsertFromProfile, profileFromRows } from '../mappers';
import { fail, ok, type RepoResult } from '../result';

type ProfileWithPreferences = ProfileRow & {
  user_preferences?: UserPreferencesRow | UserPreferencesRow[] | null;
};

const PROFILE_COLUMNS =
  'id, display_name, consent_health, created_at, updated_at, user_preferences (user_id, age, gender, activity, life_stage, preferences, allergies, health_context, goal, energy_reference_kcal)';

/**
 * The signed-in user's profile and consent-gated context.
 *
 * Returns null when the rows do not exist yet, which happens if the
 * handle_new_user trigger has not been installed in the project.
 */
export async function fetchProfile(client: GebetaClient, userId: string): Promise<RepoResult<Profile | null>> {
  const { data, error } = await client.from('profiles').select(PROFILE_COLUMNS).eq('id', userId).maybeSingle();

  if (error) return fail(error, 'Your profile could not be loaded.');
  if (!data) return ok(null);

  const row = data as unknown as ProfileWithPreferences;
  const preferences = Array.isArray(row.user_preferences) ? row.user_preferences[0] : row.user_preferences;
  return ok(profileFromRows(row, preferences ?? null));
}

/**
 * Writes the display name and consent first, then the optional fields.
 *
 * That order matters: clearing consent fires apply_consent_withdrawal, which
 * empties the preferences row, and the second statement then writes the same
 * empty values rather than racing against the trigger.
 */
export async function saveProfile(
  client: GebetaClient,
  profile: Profile,
  userId: string,
): Promise<RepoResult<Profile>> {
  const profileUpsert = {
    id: userId,
    display_name: profile.displayName.slice(0, 60),
    consent_health: profile.consent,
  };

  const { error: profileError } = await client.from('profiles').upsert(profileUpsert as never, { onConflict: 'id' });
  if (profileError) return fail(profileError, 'Your profile could not be saved.');

  const preferences = preferencesUpsertFromProfile(profile, userId);
  const { error: preferencesError } = await client
    .from('user_preferences')
    .upsert(preferences as never, { onConflict: 'user_id' });
  if (preferencesError) return fail(preferencesError, 'Your optional details could not be saved.');

  return ok(profile);
}

/** Roles are read from the database. A role is never taken from the client. */
export async function fetchRoles(client: GebetaClient, userId: string): Promise<RepoResult<string[]>> {
  const { data, error } = await client.from('user_roles').select('role').eq('user_id', userId);
  if (error) return fail(error, 'Your account permissions could not be read.');
  return ok(((data ?? []) as unknown as UserRoleRow[]).map((row) => row.role));
}
