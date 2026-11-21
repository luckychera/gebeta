// Turning Supabase failures into something a person can act on, without
// leaking a key, a token, or another user's data into the message.

export type SupabaseLikeError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  status?: number | null;
};

export const MISSING_TABLES_MESSAGE =
  'The Gebeta tables are not in this Supabase project yet. Run the files in supabase/migrations, then reload.';

const NOT_AUTHORIZED_MESSAGE =
  'This account is not allowed to do that. Access is decided by the database, not by the screen you are on.';

export function isMissingTableError(error: SupabaseLikeError | null | undefined): boolean {
  if (!error) return false;
  if (error.code === 'PGRST205' || error.code === '42P01') return true;
  return Boolean(error.message && error.message.includes('schema cache'));
}

export function describeSupabaseError(error: unknown, fallback: string): string {
  if (!error) return fallback;

  const candidate = error as SupabaseLikeError;
  const code = candidate.code ?? '';

  if (isMissingTableError(candidate)) return MISSING_TABLES_MESSAGE;

  switch (code) {
    case '23505':
      return 'That name is already used here. Choose a different one.';
    case '23503':
      return 'That record points at something that no longer exists. Reload and try again.';
    case '23514':
      return 'One of the values is outside what this field accepts.';
    case '42501':
    case 'PGRST116':
      return NOT_AUTHORIZED_MESSAGE;
    case 'PGRST301':
      return 'Your session expired. Sign in again.';
    default:
      break;
  }

  if (candidate.status === 401 || candidate.status === 403) return NOT_AUTHORIZED_MESSAGE;

  // Row level security rejects a write by reporting a violated policy.
  if (candidate.message && /row-level security/i.test(candidate.message)) return NOT_AUTHORIZED_MESSAGE;

  if (candidate.message && /fetch failed|network request failed|failed to fetch/i.test(candidate.message)) {
    return 'Gebeta could not reach the server. Check the connection and try again.';
  }

  return fallback;
}

export function describeAuthError(error: unknown, fallback: string): string {
  const candidate = error as SupabaseLikeError;
  const message = candidate?.message ?? '';

  if (/invalid login credentials/i.test(message)) return 'That email and password do not match an account.';
  if (/email not confirmed/i.test(message)) {
    return 'This email is not confirmed yet. Open the confirmation link Supabase sent, then sign in.';
  }
  if (/user already registered|already been registered/i.test(message)) {
    return 'An account already exists for that email. Sign in instead.';
  }
  if (/password should be at least/i.test(message)) return 'Choose a password with at least 6 characters.';
  if (/rate limit|too many requests/i.test(message)) return 'Too many attempts. Wait a minute and try again.';
  if (/signups not allowed|signup is disabled/i.test(message)) {
    return 'New sign-ups are turned off for this Supabase project.';
  }
  if (/fetch failed|network request failed|failed to fetch/i.test(message)) {
    return 'Gebeta could not reach the authentication server. Check the connection and try again.';
  }

  return message || fallback;
}
