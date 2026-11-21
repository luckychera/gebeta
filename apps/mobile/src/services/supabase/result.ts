import { describeSupabaseError, type SupabaseLikeError } from './errors';

export type RepoResult<T> = { ok: true; data: T } | { ok: false; message: string };

export function ok<T>(data: T): RepoResult<T> {
  return { ok: true, data };
}

export function fail<T>(error: unknown, fallback: string): RepoResult<T> {
  return { ok: false, message: describeSupabaseError(error, fallback) };
}

/** Narrow a PostgREST response into a repository result. */
export function fromResponse<T>(
  response: { data: T | null; error: SupabaseLikeError | null },
  fallback: string,
  empty: T,
): RepoResult<T> {
  if (response.error) return fail(response.error, fallback);
  return ok(response.data ?? empty);
}
