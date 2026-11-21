// Repository behaviour against a stubbed PostgREST client.
//
// These tests check the query the repository builds and how it reacts to a
// refusal. They cannot prove that row level security works, because that is
// enforced by the database. What they do prove is that the client always
// scopes a read to the signed-in user and never papers over an error.

import assert from 'node:assert/strict';
import test from 'node:test';
import type { GebetaClient } from './client';
import { MISSING_TABLES_MESSAGE, describeSupabaseError } from './errors';
import { fetchCatalogue } from './repositories/catalogue';
import { fetchDiary } from './repositories/diary';
import { fetchProfile } from './repositories/profile';

type Recorded = { table: string; columns: string; filters: Record<string, unknown>; order?: string };

function stubClient(response: { data: unknown; error: unknown }, log: Recorded[] = []): GebetaClient {
  const builder = (table: string) => {
    const record: Recorded = { table, columns: '', filters: {} };
    log.push(record);

    const chain: Record<string, unknown> = {
      select(columns: string) {
        record.columns = columns;
        return chain;
      },
      eq(column: string, value: unknown) {
        record.filters[column] = value;
        return chain;
      },
      order(column: string) {
        record.order = column;
        return chain;
      },
      limit() {
        return chain;
      },
      maybeSingle() {
        return Promise.resolve(response);
      },
      then(resolve: (value: unknown) => unknown) {
        return Promise.resolve(response).then(resolve);
      },
    };

    return chain;
  };

  return { from: builder } as unknown as GebetaClient;
}

test('the catalogue query asks only for published rows', async () => {
  const log: Recorded[] = [];
  const client = stubClient({ data: [], error: null }, log);

  await fetchCatalogue(client);

  assert.equal(log[0]?.table, 'food_items');
  assert.equal(log[0]?.filters.is_published, true);
  assert.match(log[0]?.columns ?? '', /food_nutrition/);
});

test('a missing table is reported as a migration that has not been run', async () => {
  const client = stubClient({
    data: null,
    error: { code: 'PGRST205', message: "Could not find the table 'public.food_items' in the schema cache" },
  });

  const result = await fetchCatalogue(client);

  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.message, MISSING_TABLES_MESSAGE);
});

test('a diary read is scoped to one user id', async () => {
  const log: Recorded[] = [];
  const client = stubClient({ data: [], error: null }, log);

  await fetchDiary(client, 'user-1');

  assert.equal(log[0]?.table, 'diary_entries');
  assert.equal(log[0]?.filters.user_id, 'user-1');
  assert.equal(log[0]?.order, 'eaten_at');
});

test('a diary read that the database refuses is surfaced, not swallowed', async () => {
  const client = stubClient({
    data: null,
    error: { code: '42501', message: 'new row violates row-level security policy' },
  });

  const result = await fetchDiary(client, 'user-1');

  assert.equal(result.ok, false);
  assert.match(result.ok === false ? result.message : '', /not allowed/i);
});

test('a profile read is scoped to one id and tolerates a missing row', async () => {
  const log: Recorded[] = [];
  const client = stubClient({ data: null, error: null }, log);

  const result = await fetchProfile(client, 'user-1');

  assert.equal(log[0]?.table, 'profiles');
  assert.equal(log[0]?.filters.id, 'user-1');
  assert.equal(result.ok, true);
  assert.equal(result.ok === true && result.data, null);
});

test('a profile read returns the mapped profile when the row exists', async () => {
  const client = stubClient({
    data: {
      id: 'user-1',
      display_name: 'Alem',
      consent_health: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      user_preferences: [
        {
          user_id: 'user-1',
          age: 30,
          gender: 'Woman',
          activity: null,
          life_stage: null,
          preferences: ['Vegetarian'],
          allergies: '',
          health_context: ['Diabetes'],
          goal: 'lose',
          energy_reference_kcal: null,
        },
      ],
    },
    error: null,
  });

  const result = await fetchProfile(client, 'user-1');

  assert.equal(result.ok, true);
  if (!result.ok || !result.data) return;
  assert.equal(result.data.displayName, 'Alem');
  assert.deepEqual(result.data.healthContext, ['Diabetes']);
});

test('error descriptions stay useful without leaking internals', () => {
  assert.match(describeSupabaseError({ code: '23505' }, 'fallback'), /already used/i);
  assert.match(describeSupabaseError({ code: 'PGRST301' }, 'fallback'), /session expired/i);
  assert.match(describeSupabaseError({ status: 403 }, 'fallback'), /not allowed/i);
  assert.match(describeSupabaseError({ message: 'Network request failed' }, 'fallback'), /could not reach/i);
  assert.equal(describeSupabaseError({ code: 'SOMETHING_NEW' }, 'fallback'), 'fallback');
  assert.equal(describeSupabaseError(null, 'fallback'), 'fallback');
});
