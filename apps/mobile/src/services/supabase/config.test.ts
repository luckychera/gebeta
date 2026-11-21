import assert from 'node:assert/strict';
import test from 'node:test';
import { looksLikeSecretKey, readSupabaseConfig } from './config';

const PUBLISHABLE = 'sb_publishable_abcdefghijklmnopqrstuv';

test('a url and publishable key are accepted', () => {
  const config = readSupabaseConfig({
    EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE,
  });

  assert.equal(config.status, 'ready');
  if (config.status !== 'ready') return;
  assert.equal(config.url, 'https://example.supabase.co');
  assert.equal(config.publishableKey, PUBLISHABLE);
});

test('a trailing slash is removed so request paths stay well formed', () => {
  const config = readSupabaseConfig({
    EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co/',
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE,
  });

  assert.equal(config.status === 'ready' && config.url, 'https://example.supabase.co');
});

test('missing configuration explains what to add and where', () => {
  const config = readSupabaseConfig({});
  assert.equal(config.status, 'missing');
  assert.match(config.status === 'missing' ? config.message : '', /apps\/mobile\/\.env/);
});

test('each missing variable is named on its own', () => {
  const noKey = readSupabaseConfig({ EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co' });
  assert.equal(noKey.status, 'missing');
  assert.match(noKey.status === 'missing' ? noKey.message : '', /PUBLISHABLE_KEY/);

  const noUrl = readSupabaseConfig({ EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE });
  assert.equal(noUrl.status, 'missing');
  assert.match(noUrl.status === 'missing' ? noUrl.message : '', /SUPABASE_URL/);
});

test('a non-https url is rejected', () => {
  const config = readSupabaseConfig({
    EXPO_PUBLIC_SUPABASE_URL: 'http://example.supabase.co',
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE,
  });
  assert.equal(config.status, 'invalid');
});

test('a secret key is refused instead of being shipped to the browser', () => {
  const config = readSupabaseConfig({
    EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_abcdefghijklmnop',
  });

  assert.equal(config.status, 'invalid');
  assert.match(config.status === 'invalid' ? config.message : '', /row level security/i);
});

test('a legacy service-role JWT is recognised as a secret', () => {
  const payload = Buffer.from(JSON.stringify({ iss: 'supabase', role: 'service_role' })).toString('base64url');
  const serviceRoleJwt = `header.${payload}.signature`;

  assert.equal(looksLikeSecretKey(serviceRoleJwt), true);

  const anonPayload = Buffer.from(JSON.stringify({ iss: 'supabase', role: 'anon' })).toString('base64url');
  assert.equal(looksLikeSecretKey(`header.${anonPayload}.signature`), false);
  assert.equal(looksLikeSecretKey(PUBLISHABLE), false);
});
