// Calling the recognize-food edge function.
//
// The Gemini key lives in Supabase, never here. This module only sends the
// image, applies a timeout, and hands the reply to the validator. Nothing it
// receives is trusted until parseRecognitionPayload has accepted it.

import { parseRecognitionPayload, type ParseOutcome } from './recognitionSchema';
import type { GebetaClient } from './supabase/client';

export const RECOGNITION_FUNCTION = 'recognize-food';

const TIMEOUT_MS = 30000;

type InvokeError = {
  name?: string;
  message?: string;
  context?: { status?: number; json?: () => Promise<unknown> };
};

async function bodyOf(error: InvokeError): Promise<Record<string, unknown> | null> {
  if (!error.context || typeof error.context.json !== 'function') return null;
  try {
    const parsed = await error.context.json();
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function reasonFor(status: number | undefined, body: Record<string, unknown> | null): string {
  const serverReason = typeof body?.reason === 'string' ? body.reason : '';
  if (serverReason) return serverReason;

  switch (status) {
    case 401:
      return 'Food recognition needs you to be signed in.';
    case 413:
      return 'That photo is too large for the recognition service.';
    case 429:
      return 'The recognition service has reached its limit for now. Try again later, or search the catalogue.';
    case 503:
      return 'The recognition service is not configured in this Supabase project yet.';
    default:
      return 'The recognition service could not be reached.';
  }
}

function unavailable(reason: string): ParseOutcome {
  return {
    ok: true,
    result: {
      provider: 'gemini',
      status: 'unavailable',
      isDemo: false,
      model: null,
      notice: reason,
      scoreNote: '',
      candidates: [],
    },
  };
}

export async function recognizeWithGemini(input: {
  client: GebetaClient;
  imageBase64: string;
  mimeType: string;
  knownSlugs: ReadonlySet<string>;
  signal?: AbortSignal;
}): Promise<ParseOutcome> {
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), TIMEOUT_MS);

  try {
    const { data, error } = await input.client.functions.invoke(RECOGNITION_FUNCTION, {
      body: { imageBase64: input.imageBase64, mimeType: input.mimeType },
      signal: input.signal ?? timeout.signal,
    });

    if (error) {
      const invokeError = error as InvokeError;
      const body = await bodyOf(invokeError);
      return unavailable(reasonFor(invokeError.context?.status, body));
    }

    return parseRecognitionPayload(data, input.knownSlugs);
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : '';
    if (/abort/i.test(message)) {
      return unavailable('The recognition service took too long to answer.');
    }
    return unavailable('Gebeta could not reach the recognition service.');
  } finally {
    clearTimeout(timer);
  }
}
