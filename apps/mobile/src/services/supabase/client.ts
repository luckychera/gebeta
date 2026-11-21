import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { readSupabaseConfig, type SupabaseConfig } from './config';
import type { Database } from './database.types';

export type GebetaClient = SupabaseClient<Database>;

// Expo replaces EXPO_PUBLIC_* with literals at build time, so each variable
// has to be referenced by name rather than looked up dynamically.
export const supabaseConfig: SupabaseConfig = readSupabaseConfig({
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});

export const supabaseSetupError: string | null =
  supabaseConfig.status === 'ready' ? null : supabaseConfig.message;

let client: GebetaClient | null = null;

if (supabaseConfig.status === 'ready') {
  client = createClient<Database>(supabaseConfig.url, supabaseConfig.publishableKey, {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      // Only the browser receives the confirmation redirect in its address bar.
      detectSessionInUrl: Platform.OS === 'web',
      flowType: 'pkce',
    },
    global: {
      headers: { 'x-client-info': 'gebeta-mobile' },
    },
  });
}

/** The shared client, or null when the project is not configured. */
export function getSupabase(): GebetaClient | null {
  return client;
}

/** Use where a caller has already checked configuration and cannot continue without it. */
export function requireSupabase(): GebetaClient {
  if (!client) {
    throw new Error(supabaseSetupError ?? 'Supabase is not configured.');
  }
  return client;
}

export const isSupabaseConfigured = client !== null;
