import { Platform } from 'react-native';

const CONFIGURED_BASE = (process.env.EXPO_PUBLIC_WEB_BASE_URL ?? '').trim();

export function currentWebBase(): string | null {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return CONFIGURED_BASE ? CONFIGURED_BASE : null;
}
