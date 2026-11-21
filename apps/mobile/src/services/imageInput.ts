// Image checks applied before a photo leaves the device.
//
// The same limits are enforced again inside the edge function. These exist so
// a person gets a useful message instead of a rejected upload.

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export type ImageCheck = { ok: true; mimeType: string } | { ok: false; reason: string };

const EXTENSION_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

function readableSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Best effort type detection from a data URI, a file name, or a path. */
export function guessMimeType(reference: string | null | undefined): string | null {
  if (!reference) return null;

  const dataUri = /^data:([a-z]+\/[a-z0-9.+-]+);base64,/i.exec(reference);
  if (dataUri?.[1]) return dataUri[1].toLowerCase();

  const withoutQuery = reference.split('?')[0] ?? '';
  const extension = withoutQuery.split('.').pop()?.toLowerCase() ?? '';
  return EXTENSION_TYPES[extension] ?? null;
}

/** Decoded size of a base64 string, without allocating the bytes. */
export function base64ByteLength(base64: string): number {
  const body = base64.includes(',') ? (base64.split(',')[1] ?? '') : base64;
  const clean = body.replace(/\s/g, '');
  if (clean.length === 0) return 0;
  const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0;
  return Math.floor((clean.length * 3) / 4) - padding;
}

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Decodes base64 without relying on atob or Buffer, neither of which is
 * guaranteed to exist on every React Native runtime.
 */
export function base64ToBytes(base64: string): Uint8Array {
  const body = base64.includes(',') ? (base64.split(',')[1] ?? '') : base64;
  const clean = body.replace(/[^A-Za-z0-9+/]/g, '');
  const bytes = new Uint8Array(Math.floor((clean.length * 3) / 4));

  let byteIndex = 0;
  let buffer = 0;
  let bits = 0;

  for (const character of clean) {
    const value = BASE64_ALPHABET.indexOf(character);
    if (value < 0) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes[byteIndex] = (buffer >> bits) & 0xff;
      byteIndex += 1;
    }
  }

  return bytes.subarray(0, byteIndex);
}

export function checkImage(input: {
  mimeType?: string | null;
  byteSize?: number | null;
  reference?: string | null;
}): ImageCheck {
  const mimeType = (input.mimeType ?? guessMimeType(input.reference) ?? '').toLowerCase();

  if (!mimeType) {
    return { ok: false, reason: 'Gebeta could not tell what kind of file that is. Use a JPEG, PNG, or WebP photo.' };
  }
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(mimeType)) {
    return { ok: false, reason: 'That file type is not supported. Use a JPEG, PNG, or WebP photo.' };
  }

  const size = input.byteSize ?? null;
  if (size !== null) {
    if (size <= 0) {
      return { ok: false, reason: 'That image is empty. Take or choose another photo.' };
    }
    if (size > MAX_IMAGE_BYTES) {
      return {
        ok: false,
        reason: `That image is ${readableSize(size)}. The limit is ${readableSize(MAX_IMAGE_BYTES)}. Take the photo at a lower quality and try again.`,
      };
    }
  }

  return { ok: true, mimeType };
}
