// Credential checks and sign-up interpretation.
//
// Kept separate from the React provider so the rules can be tested without a
// network or a running Supabase project.

export const MIN_PASSWORD_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!value) return 'Enter your email address.';
  if (value.length > 254) return 'That email address is too long.';
  if (!EMAIL_PATTERN.test(value)) return 'Enter an email address in the form name@example.com.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Enter a password.';
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > 72) return 'Use 72 characters or fewer.';
  return null;
}

export function validateDisplayName(name: string): string | null {
  if (name.trim().length > 60) return 'Use 60 characters or fewer.';
  return null;
}

export type SignUpOutcome =
  | { kind: 'signed-in'; message: string }
  | { kind: 'confirm-email'; message: string }
  | { kind: 'already-registered'; message: string };

/**
 * Supabase answers a sign-up in three different ways and the difference
 * matters to the person at the screen.
 *
 * With email confirmation on, a brand new address returns a user without a
 * session, and an address that already exists returns a user with no
 * identities. Reading that second case is the only way to tell the two apart
 * without leaking whether an account exists to an attacker probing the API,
 * which is exactly why Supabase shapes the reply this way.
 */
export function describeSignUp(result: {
  hasSession: boolean;
  userId: string | null;
  identityCount: number | null;
  email: string;
}): SignUpOutcome {
  if (result.hasSession) {
    return { kind: 'signed-in', message: 'Your account is ready. You are signed in.' };
  }
  if (result.userId && result.identityCount === 0) {
    return {
      kind: 'already-registered',
      message: 'An account already exists for that email. Sign in, or use the password reset in Supabase.',
    };
  }
  return {
    kind: 'confirm-email',
    message: `Check ${result.email} for a confirmation link from Supabase, then come back and sign in.`,
  };
}
