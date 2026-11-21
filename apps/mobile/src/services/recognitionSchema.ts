// Validation of the payload returned by the recognize-food edge function.
//
// The edge function validates the model output before it replies. This is the
// second check, on the client, because a recognition result ends up in front
// of a person deciding what they ate: it must never contain a food the
// catalogue does not have, a confidence the model never gave, or a nutrition
// value invented along the way.

import type { RecognitionCandidate, RecognitionResult, RecognitionStatus } from '../types';

export type ParseOutcome =
  | { ok: true; result: RecognitionResult }
  | { ok: false; reason: string };

const MAX_CANDIDATES = 5;
const MAX_LABEL = 80;
const MAX_EXPLANATION = 240;

const STATUSES: RecognitionStatus[] = ['matched', 'no_match', 'unavailable'];

function text(value: unknown, limit: number): string {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

function confidence(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  if (value < 0 || value > 1) return null;
  return Math.round(value * 100) / 100;
}

function candidateFrom(value: unknown, knownSlugs: ReadonlySet<string>): RecognitionCandidate | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;

  const label = text(raw.name ?? raw.label, MAX_LABEL);
  if (!label) return null;

  const slug = text(raw.foodSlug ?? raw.foodId, 60);

  return {
    foodId: slug && knownSlugs.has(slug) ? slug : null,
    label,
    localName: text(raw.localName, MAX_LABEL) || null,
    confidence: confidence(raw.confidence),
    explanation: text(raw.explanation, MAX_EXPLANATION),
  };
}

const MATCHED_NOTICE =
  'Gemini suggested these foods from the photo. A model guesses the dish; it cannot read ingredients, oil, allergens, or portion weight. Confirm or correct the choice before saving.';

const NO_MATCH_NOTICE =
  'Gemini answered, but nothing it suggested matches a food in the Gebeta catalogue. Search for the dish yourself, or try another photo.';

/**
 * Turns an unknown payload into a recognition result, or explains why it
 * could not be trusted. A refusal here is what makes the scan screen fall
 * back to the clearly labelled demo path.
 */
export function parseRecognitionPayload(value: unknown, knownSlugs: ReadonlySet<string>): ParseOutcome {
  if (!value || typeof value !== 'object') {
    return { ok: false, reason: 'The recognition service returned something that was not a result.' };
  }

  const raw = value as Record<string, unknown>;
  const status = typeof raw.status === 'string' ? raw.status : '';
  if (!STATUSES.includes(status as RecognitionStatus)) {
    return { ok: false, reason: 'The recognition service returned an unknown status.' };
  }

  const model = text(raw.model, 60) || null;

  if (status === 'unavailable') {
    return {
      ok: true,
      result: {
        provider: 'gemini',
        status: 'unavailable',
        isDemo: false,
        model,
        notice: text(raw.reason, MAX_EXPLANATION) || 'The recognition service is not available right now.',
        scoreNote: '',
        candidates: [],
      },
    };
  }

  const rawCandidates = Array.isArray(raw.candidates) ? raw.candidates.slice(0, MAX_CANDIDATES) : [];
  const candidates = rawCandidates
    .map((item) => candidateFrom(item, knownSlugs))
    .filter((item): item is RecognitionCandidate => item !== null);

  if (status === 'matched' && !candidates.some((item) => item.foodId !== null)) {
    // The service claimed a match but nothing lines up with the catalogue.
    // Report that honestly rather than showing a food the user cannot open.
    return {
      ok: true,
      result: {
        provider: 'gemini',
        status: 'no_match',
        isDemo: false,
        model,
        notice: NO_MATCH_NOTICE,
        scoreNote: scoreNoteFor(candidates),
        candidates,
      },
    };
  }

  return {
    ok: true,
    result: {
      provider: 'gemini',
      status: status as RecognitionStatus,
      isDemo: false,
      model,
      notice: status === 'matched' ? MATCHED_NOTICE : NO_MATCH_NOTICE,
      scoreNote: scoreNoteFor(candidates),
      candidates,
    },
  };
}

function scoreNoteFor(candidates: RecognitionCandidate[]): string {
  const scored = candidates.some((item) => item.confidence !== null);
  return scored
    ? 'The score is the model’s own confidence in the name of the dish. It says nothing about ingredients, portion size, or whether the food is safe for you.'
    : 'The model did not return a confidence score, so none is shown.';
}
