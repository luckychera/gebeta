export const APP_SCHEME = 'gebeta';

export type ShareLink = {
  url: string;
  kind: 'web' | 'app';
};

export function providerPath(providerId: string): string {
  return `/provider/${providerId}`;
}

export function buildProviderLink(webBase: string | null | undefined, providerId: string): ShareLink {
  const base = (webBase ?? '').trim().replace(/\/+$/, '');
  if (base && /^https?:\/\//i.test(base)) {
    return { url: `${base}${providerPath(providerId)}`, kind: 'web' };
  }
  return { url: `${APP_SCHEME}:/${providerPath(providerId)}`, kind: 'app' };
}
