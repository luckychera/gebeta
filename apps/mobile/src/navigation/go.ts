import { router, type Href } from 'expo-router';

export function go(path: string): void {
  router.push(path as Href);
}

export function replace(path: string): void {
  router.replace(path as Href);
}

export function back(fallback = '/(tabs)'): void {
  if (router.canGoBack()) router.back();
  else router.replace(fallback as Href);
}
