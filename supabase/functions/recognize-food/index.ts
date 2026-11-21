// Gebeta food recognition.
//
// The only place in this project that holds a Gemini key. The Expo client
// sends an image and gets back a validated list of candidate dish names,
// already checked against the Gebeta catalogue.
//
// What this function will not do:
//   * return a nutrition value from the model (nutrition comes from the
//     database, and an unknown nutrient stays unknown),
//   * accept a catalogue identifier chosen by the model,
//   * log the image, the prompt, the key, or anything about the caller
//     beyond a rate-limiting row.
//
// Required secrets:
//   GEMINI_API_KEY   the API key, set with `supabase secrets set`
//   GEMINI_MODEL     optional, defaults to gemini-2.5-flash

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders, jsonResponse, unavailable } from './cors.ts';
import { matchCatalogue, type CatalogueEntry } from './match.ts';

const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_BODY_BYTES = 6 * 1024 * 1024;
const RATE_LIMIT_PER_HOUR = 20;
const GEMINI_TIMEOUT_MS = 25000;

const PROMPT = [
  'You identify dishes in a photograph of food, with an emphasis on Ethiopian and other East African cooking.',
  'Return at most four candidate dishes, most likely first.',
  'Use the common English or transliterated name of the dish, for example "Doro Wot" or "Injera".',
  'If the picture is not food, or you cannot tell, return an empty candidate list.',
  'Give confidence as a number between 0 and 1 reflecting how sure you are of the NAME of the dish only.',
  'Never state nutrition values, calories, ingredients quantities, portion weight, or whether the food is safe for anyone.',
  'Keep each explanation under 200 characters and describe only what is visible.',
].join(' ');

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    candidates: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          localName: { type: 'STRING' },
          confidence: { type: 'NUMBER' },
          explanation: { type: 'STRING' },
        },
        required: ['name', 'confidence'],
      },
    },
  },
  required: ['candidates'],
};

type ModelCandidate = { name: string; localName?: string; confidence?: number; explanation?: string };

function base64ByteLength(base64: string): number {
  const body = base64.includes(',') ? (base64.split(',')[1] ?? '') : base64;
  const clean = body.replace(/\s/g, '');
  if (!clean) return 0;
  const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0;
  return Math.floor((clean.length * 3) / 4) - padding;
}

function stripDataUri(base64: string): string {
  return base64.includes(',') ? (base64.split(',')[1] ?? '') : base64;
}

function clampText(value: unknown, limit: number): string {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

function clampConfidence(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  if (value < 0 || value > 1) return null;
  return Math.round(value * 100) / 100;
}

async function callGemini(imageBase64: string, mimeType: string): Promise<ModelCandidate[] | 'quota' | 'error'> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: PROMPT }, { inlineData: { mimeType, data: imageBase64 } }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      },
    );

    if (response.status === 429) return 'quota';
    if (!response.ok) {
      // The status is useful; the body may echo request content, so it is not logged.
      console.error('gemini_http_error', response.status);
      return 'error';
    }

    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== 'string') return 'error';

    const parsed = JSON.parse(text);
    if (!parsed || !Array.isArray(parsed.candidates)) return 'error';
    return parsed.candidates as ModelCandidate[];
  } catch (error) {
    console.error('gemini_call_failed', error instanceof Error ? error.name : 'unknown');
    return 'error';
  } finally {
    clearTimeout(timer);
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return unavailable('Use POST.', 405);

  if (!GEMINI_API_KEY) {
    return unavailable(
      'Gemini is not configured for this project. An administrator needs to set the GEMINI_API_KEY function secret.',
      503,
    );
  }
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return unavailable('The recognition service is not configured correctly.', 503);
  }

  const authorization = request.headers.get('Authorization') ?? '';
  if (!authorization.startsWith('Bearer ')) {
    return unavailable('Food recognition needs you to be signed in.', 401);
  }

  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (declaredLength > MAX_BODY_BYTES) {
    return unavailable('That photo is too large. Use an image under 4 MB.', 413);
  }

  // --- caller identity ------------------------------------------------------

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  const user = userData?.user ?? null;
  if (userError || !user) {
    return unavailable('Food recognition needs you to be signed in.', 401);
  }

  // --- input ----------------------------------------------------------------

  let body: { imageBase64?: unknown; mimeType?: unknown };
  try {
    body = await request.json();
  } catch {
    return unavailable('That request could not be read.', 400);
  }

  const mimeType = typeof body.mimeType === 'string' ? body.mimeType.toLowerCase() : '';
  if (!ALLOWED_MIME.has(mimeType)) {
    return unavailable('That file type is not supported. Use a JPEG, PNG, or WebP photo.', 415);
  }

  const rawBase64 = typeof body.imageBase64 === 'string' ? stripDataUri(body.imageBase64) : '';
  const imageBytes = base64ByteLength(rawBase64);
  if (imageBytes === 0) return unavailable('No image was received.', 400);
  if (imageBytes > MAX_IMAGE_BYTES) {
    return unavailable('That photo is too large. Use an image under 4 MB.', 413);
  }

  // --- rate limit -----------------------------------------------------------

  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const windowStart = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await adminClient
    .from('ai_recognition_requests')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', windowStart);

  if (!countError && (count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    return unavailable(
      `This account has used ${RATE_LIMIT_PER_HOUR} recognitions in the last hour, which is the limit. Try again later, or search the catalogue.`,
      429,
    );
  }

  // --- catalogue ------------------------------------------------------------

  const { data: catalogueRows, error: catalogueError } = await adminClient
    .from('food_items')
    .select('slug, name, local_names')
    .eq('is_published', true);

  if (catalogueError) {
    return unavailable('The Gebeta catalogue could not be read, so nothing can be matched.', 503);
  }

  const catalogue: CatalogueEntry[] = (catalogueRows ?? []).map((row) => ({
    slug: row.slug as string,
    name: row.name as string,
    localNames: Array.isArray(row.local_names) ? (row.local_names as string[]) : [],
  }));

  // --- model ----------------------------------------------------------------

  const modelResult = await callGemini(rawBase64, mimeType);

  if (modelResult === 'quota') {
    await adminClient
      .from('ai_recognition_requests')
      .insert({ user_id: user.id, model: GEMINI_MODEL, outcome: 'unavailable' });
    return unavailable('Gemini has reached its quota for now. Try again later, or search the catalogue.', 429);
  }
  if (modelResult === 'error') {
    await adminClient
      .from('ai_recognition_requests')
      .insert({ user_id: user.id, model: GEMINI_MODEL, outcome: 'unavailable' });
    return unavailable('Gemini did not return a usable answer. Try again, or search the catalogue.', 200);
  }

  // --- validate and match ---------------------------------------------------

  const candidates = modelResult
    .slice(0, 4)
    .map((item) => {
      const name = clampText(item?.name, 80);
      if (!name) return null;
      return {
        name,
        localName: clampText(item?.localName, 80) || null,
        confidence: clampConfidence(item?.confidence),
        explanation: clampText(item?.explanation, 240),
        foodSlug: matchCatalogue(name, catalogue),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const status = candidates.some((item) => item.foodSlug !== null) ? 'matched' : 'no_match';

  await adminClient
    .from('ai_recognition_requests')
    .insert({ user_id: user.id, model: GEMINI_MODEL, outcome: status });

  return jsonResponse({ status, model: GEMINI_MODEL, candidates });
});
