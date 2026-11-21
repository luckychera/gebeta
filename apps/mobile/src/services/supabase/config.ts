// Reading and validating the Supabase configuration.
//
// This module is deliberately pure: it takes an environment object and returns
// a result. The Expo client passes process.env, and the tests pass fixtures.

import { base64ToBytes } from '../imageInput';

export type SupabaseConfig =
  | { status: 'ready'; url: string; publishableKey: string }
  | { status: 'missing'; message: string }
  | { status: 'invalid'; message: string };

export type SupabaseEnv = {
  EXPO_PUBLIC_SUPABASE_URL?: string | undefined;
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string | undefined;
};

const SETUP_HINT =
  'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to apps/mobile/.env, then restart Expo so the values are rebuilt into the client.';

/**
 * A secret key must never reach the browser bundle. Both key formats Supabase
 * issues are recognised here: the current `sb_secret_...` keys and the legacy
 * service-role JWT, whose middle segment carries "role":"service_role".
 */
export function looksLikeSecretKey(key: string): boolean {
  const value = key.trim();
  if (value.startsWith('sb_secret_')) return true;

  const segments = value.split('.');
  if (segments.length !== 3) return false;
  const payload = segments[1];
  if (!payload) return false;

  try {
    const bytes = base64ToBytes(payload.replace(/-/g, '+').replace(/_/g, '/'));
    let decoded = '';
    for (const byte of bytes) decoded += String.fromCharCode(byte);
    return /"role"\s*:\s*"service_role"/.test(decoded);
  } catch {
    return false;
  }
}

export function readSupabaseConfig(env: SupabaseEnv): SupabaseConfig {
  const url = (env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim();
  const key = (env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '').trim();

  if (!url && !key) {
    return { status: 'missing', message: `Gebeta is not connected to Supabase. ${SETUP_HINT}` };
  }
  if (!url) {
    return { status: 'missing', message: `EXPO_PUBLIC_SUPABASE_URL is empty. ${SETUP_HINT}` };
  }
  if (!key) {
    return { status: 'missing', message: `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY is empty. ${SETUP_HINT}` };
  }
  if (!/^https:\/\/[^\s/]+/i.test(url)) {
    return {
      status: 'invalid',
      message: 'EXPO_PUBLIC_SUPABASE_URL must be the https project URL, for example https://your-project.supabase.co.',
    };
  }
  if (looksLikeSecretKey(key)) {
    return {
      status: 'invalid',
      message:
        'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY looks like a secret or service-role key. That key bypasses row level security and must never be shipped in the app. Use the publishable key instead.',
    };
  }

  return { status: 'ready', url: url.replace(/\/+$/, ''), publishableKey: key };
}

export function isConfigured(config: SupabaseConfig): config is Extract<SupabaseConfig, { status: 'ready' }> {
  return config.status === 'ready';
}
