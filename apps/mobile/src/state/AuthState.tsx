import type { Session, User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState as RNAppState, Platform } from 'react-native';
import { describeSignUp, validateDisplayName, validateEmail, validatePassword } from '../services/authRules';
import { getSupabase, supabaseSetupError } from '../services/supabase/client';
import { describeAuthError } from '../services/supabase/errors';
import { fetchRoles } from '../services/supabase/repositories/profile';

export type AuthStatus = 'loading' | 'signed-in' | 'signed-out' | 'unconfigured';

type AuthValue = {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  userId: string | null;
  roles: string[];
  busy: boolean;
  error: string | null;
  notice: string | null;
  setupError: string | null;
  signUp: (input: { email: string; password: string; displayName: string }) => Promise<boolean>;
  signIn: (input: { email: string; password: string }) => Promise<boolean>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  clearMessages: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const client = getSupabase();
  const [status, setStatus] = useState<AuthStatus>(client ? 'loading' : 'unconfigured');
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!client) return undefined;
    let active = true;

    client.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session ?? null);
        setStatus(data.session ? 'signed-in' : 'signed-out');
      })
      .catch(() => {
        if (!active) return;
        setStatus('signed-out');
        setError('The saved session could not be read. Sign in again.');
      });

    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setStatus(nextSession ? 'signed-in' : 'signed-out');
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [client]);

  // On a device the refresh timer has to stop while the app is backgrounded,
  // otherwise Supabase keeps retrying a refresh that cannot complete.
  useEffect(() => {
    if (!client || Platform.OS === 'web') return undefined;
    const subscription = RNAppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void client.auth.startAutoRefresh();
      } else {
        void client.auth.stopAutoRefresh();
      }
    });
    void client.auth.startAutoRefresh();
    return () => subscription.remove();
  }, [client]);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!client || !userId) {
      setRoles([]);
      return;
    }
    let active = true;
    void fetchRoles(client, userId).then((result) => {
      if (!active) return;
      setRoles(result.ok ? result.data : []);
    });
    return () => {
      active = false;
    };
  }, [client, userId]);

  const clearMessages = useCallback(() => {
    setError(null);
    setNotice(null);
  }, []);

  const signUp = useCallback<AuthValue['signUp']>(
    async ({ email, password, displayName }) => {
      if (!client) {
        setError(supabaseSetupError);
        return false;
      }
      const invalid = validateEmail(email) ?? validatePassword(password) ?? validateDisplayName(displayName);
      if (invalid) {
        setError(invalid);
        return false;
      }

      setBusy(true);
      setError(null);
      setNotice(null);
      try {
        const { data, error: signUpError } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: displayName.trim().slice(0, 60) } },
        });

        if (signUpError) {
          setError(describeAuthError(signUpError, 'That account could not be created.'));
          return false;
        }

        const outcome = describeSignUp({
          hasSession: Boolean(data.session),
          userId: data.user?.id ?? null,
          identityCount: data.user?.identities?.length ?? null,
          email: email.trim(),
        });

        if (outcome.kind === 'already-registered') {
          setError(outcome.message);
          return false;
        }
        setNotice(outcome.message);
        return true;
      } finally {
        setBusy(false);
      }
    },
    [client],
  );

  const signIn = useCallback<AuthValue['signIn']>(
    async ({ email, password }) => {
      if (!client) {
        setError(supabaseSetupError);
        return false;
      }
      const invalid = validateEmail(email) ?? validatePassword(password);
      if (invalid) {
        setError(invalid);
        return false;
      }

      setBusy(true);
      setError(null);
      setNotice(null);
      try {
        const { error: signInError } = await client.auth.signInWithPassword({ email: email.trim(), password });
        if (signInError) {
          setError(describeAuthError(signInError, 'That sign in did not work.'));
          return false;
        }
        return true;
      } finally {
        setBusy(false);
      }
    },
    [client],
  );

  const signOut = useCallback(async () => {
    if (!client) return;
    setBusy(true);
    setError(null);
    try {
      const { error: signOutError } = await client.auth.signOut();
      if (signOutError) setError(describeAuthError(signOutError, 'Sign out did not complete.'));
      else setNotice('You are signed out on this device.');
    } finally {
      setBusy(false);
    }
  }, [client]);

  const resendConfirmation = useCallback(
    async (email: string) => {
      if (!client) return;
      const invalid = validateEmail(email);
      if (invalid) {
        setError(invalid);
        return;
      }
      setBusy(true);
      try {
        const { error: resendError } = await client.auth.resend({ type: 'signup', email: email.trim() });
        if (resendError) setError(describeAuthError(resendError, 'That confirmation email could not be sent again.'));
        else setNotice(`A new confirmation link was sent to ${email.trim()}.`);
      } finally {
        setBusy(false);
      }
    },
    [client],
  );

  const value = useMemo<AuthValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      userId,
      roles,
      busy,
      error,
      notice,
      setupError: supabaseSetupError,
      signUp,
      signIn,
      signOut,
      resendConfirmation,
      clearMessages,
    }),
    [status, session, userId, roles, busy, error, notice, signUp, signIn, signOut, resendConfirmation, clearMessages],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
