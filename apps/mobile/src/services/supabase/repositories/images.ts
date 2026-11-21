// Uploads into the private food-uploads bucket.
//
// The object path always starts with the owner's user id, which is what the
// storage policies match on. Nothing here produces a public URL: reading an
// uploaded photo back needs a short-lived signed URL.

import { base64ToBytes, checkImage, MAX_IMAGE_BYTES } from '../../imageInput';
import type { GebetaClient } from '../client';
import { fail, ok, type RepoResult } from '../result';

export const UPLOAD_BUCKET = 'food-uploads';

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function objectPath(userId: string, mimeType: string): string {
  const extension = EXTENSIONS[mimeType] ?? 'jpg';
  const unique = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${userId}/${unique}.${extension}`;
}

/**
 * Stores a photo the user explicitly chose to keep. Returns the object path,
 * which is what food_submissions.image_path holds.
 */
export async function uploadFoodImage(
  client: GebetaClient,
  input: { userId: string; base64: string; mimeType: string },
): Promise<RepoResult<string>> {
  const bytes = base64ToBytes(input.base64);
  const check = checkImage({ mimeType: input.mimeType, byteSize: bytes.byteLength });
  if (!check.ok) return { ok: false, message: check.reason };
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    return { ok: false, message: 'That image is larger than the upload limit.' };
  }

  const path = objectPath(input.userId, check.mimeType);
  const { error } = await client.storage.from(UPLOAD_BUCKET).upload(path, bytes as unknown as ArrayBuffer, {
    contentType: check.mimeType,
    upsert: false,
  });

  if (error) return fail(error, 'That photo could not be uploaded.');
  return ok(path);
}

/** Short-lived read access for the owner or an assigned reviewer. */
export async function signFoodImage(
  client: GebetaClient,
  path: string,
  expiresInSeconds = 120,
): Promise<RepoResult<string>> {
  const { data, error } = await client.storage.from(UPLOAD_BUCKET).createSignedUrl(path, expiresInSeconds);
  if (error || !data) return fail(error, 'That photo could not be opened.');
  return ok(data.signedUrl);
}

export async function deleteFoodImage(client: GebetaClient, path: string): Promise<RepoResult<true>> {
  const { error } = await client.storage.from(UPLOAD_BUCKET).remove([path]);
  if (error) return fail(error, 'That photo could not be deleted.');
  return ok(true);
}
