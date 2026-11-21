# Gebeta — Demo Architecture

Version: 1.1
Status: Hackathon implementation baseline

## 0. Implemented Architecture in This Repository

Sections 2 onward describe the target architecture. This section records what the repository actually contains today, so the two are never confused.

### Implemented

| Concern | Implementation | Location |
| --- | --- | --- |
| Client | Expo SDK 58, React Native, Expo Router, React 19, TypeScript | `apps/mobile` |
| Web delivery | Expo web export (`expo export --platform web`), single-page output | `apps/mobile/dist` |
| Authentication | Supabase Auth, email and password, PKCE, session persisted through AsyncStorage | `apps/mobile/src/state/AuthState.tsx` |
| Database | Supabase PostgreSQL, 14 tables, row level security on all of them | `supabase/migrations` |
| Data access | Typed repositories returning a result object rather than throwing | `apps/mobile/src/services/supabase/repositories` |
| Storage | `catalogue-images` (public, admin-writable) and `food-uploads` (private, owner-scoped, signed reads) | `supabase/migrations/20261121090200_storage.sql` |
| AI recognition | Google Gemini, called only from an edge function, key held as a function secret | `supabase/functions/recognize-food` |
| Fallback | Bundled catalogue plus AsyncStorage under `gebeta.nutriguider.v1`, labelled on screen | `apps/mobile/src/state/AppState.tsx` |

The client talks to Supabase directly rather than through an intermediate API, so authorization is enforced by row level security and by `security definer` helper functions, not by the UI. Two things never reach the browser: the service-role key, which exists only inside the edge function runtime, and the Gemini key, which is a function secret.

### State has two independent halves

Signed out, the app is a self-contained demo: the bundled catalogue, a local profile, and a local diary in AsyncStorage. Signed in, the catalogue, profile, and diary come from Supabase and are held in memory only.

These two halves never merge. Signing in does not upload local demo rows over server data, and signing out does not leave account data on the device. When the Supabase tables are missing or unreachable, the app falls back to the bundled catalogue and says so rather than presenting stale data as live.

### Not implemented

- The Node.js and Express API in `backend`. The directory is still a placeholder.
- A React and Vite web client in `apps/web`. The browser demo is the Expo web export.
- Ordering, payments, delivery, and provider billing.

### Why the demo client is Expo

The demo needed one coherent vertical journey — discover, scan, confirm, nutrition, diary — plus provider, institution, and admin supporting views, within a hackathon timebox. Building that once in Expo and exporting it to the web gave a working browser demo and a phone-capable client from a single codebase. The cost is that the web demo is a phone-width layout rather than a full desktop website. That limit is recorded in `docs/DEMO_SCOPE.md`.

### Why there is no Express tier yet

Section 2 keeps Node and Express as the target for application logic. The hackathon build reaches Supabase directly instead, because every rule the API would enforce — ownership, roles, consent, provider membership, reviewer assignment — is expressible as a row level security policy, and a policy cannot be bypassed by a forgotten check in a handler. The one operation that genuinely needs a server, the Gemini call with its secret key, runs in an edge function. Adding Express later does not invalidate the policies; they remain the last line of defence underneath it.

## 1. Architecture Goal

Build a responsive web application with a modular backend and a clear path toward a larger platform.

The hackathon implementation should remain simple.

Do not introduce infrastructure that is not required to demonstrate the product.

## 2. Selected Technology

The technology below is the target for Phase 2. For what exists today, see section 0.

### Frontend

- React
- TypeScript
- Vite
- Existing styling system
- Existing routing solution

Responsibilities:

- Public website.
- Food discovery.
- Scan interface.
- Nutrition results.
- Food diary.
- Provider dashboard.
- Institution review interface.
- Admin interface.

### Backend

- Node.js
- Express

Responsibilities:

- Business logic.
- Input validation.
- Role and permission checks.
- Food catalogue operations.
- Scan orchestration.
- Nutrition lookup.
- Diary operations.
- Provider menu operations.
- Institution review operations.
- Admin moderation.
- AI service integration.

### Supabase

Use the selected Supabase services:

- Supabase Auth for authentication.
- Supabase PostgreSQL for application data.
- Supabase Storage for uploaded food images where configured.

The backend must enforce business permissions even when Supabase Auth is used.

## 3. High-Level Request Flow

Browser
|
v
React Web Application
|
v
Node.js / Express API
|
+---- Supabase Auth
|
+---- Supabase PostgreSQL
|
+---- Supabase Storage
|
+---- AI Recognition Adapter
|
+---- Nutrition Data Service

The browser must not receive privileged service credentials.

## 4. Application Modules

### Frontend modules

- Public website
- Authentication
- Food catalogue
- Food scan
- Nutrition result
- Food diary
- Provider dashboard
- Institution dashboard
- Admin dashboard
- Shared UI components

### Backend modules

- Auth integration
- User/profile
- Food catalogue
- Food scan
- AI recognition
- Nutrition
- Diary
- Provider
- Menu
- Institution review
- Administration
- Audit/activity

Follow the repository's existing module structure. Do not reorganize the project without need.

## 5. AI Recognition Adapter

Create a stable application interface for image recognition.

The rest of the application should not depend directly on a specific AI vendor.

The implemented contract is `RecognitionResult` in `apps/mobile/src/types/index.ts`:

```ts
{
  provider: 'gemini' | 'demo-fallback',
  status: 'matched' | 'no_match' | 'unavailable',
  isDemo: boolean,
  model: string | null,
  notice: string,
  scoreNote: string,
  candidates: { foodId, label, localName, confidence, explanation }[]
}
```

Both adapters return this shape: `recognizeWithGemini` in `recognitionRemote.ts` and `recognizeDemo` in `recognition.ts`.

### How the Gemini path is constrained

The edge function is the only place that holds the key. Before it calls the model it requires a bearer token and resolves it with `auth.getUser()`, rejects anything that is not JPEG, PNG, or WebP, rejects images over 4 MB, and refuses a user who has made more than 20 requests in the last hour.

The prompt asks only for candidate food names, and explicitly forbids nutrition values. Gemini never sees the user's health profile. The reply is requested as structured JSON and then validated: the candidate list is capped, text is truncated, confidences outside 0 to 1 are dropped, and each `foodSlug` must match a row in the catalogue or it becomes `null`. A result that claims a match but resolves to nothing is downgraded to `no_match`. Nutrition is read from the database for the food the user confirms, never from the model.

### Demo mode

When no key is configured, or the call fails, `recognizeDemo` returns catalogue entries with `provider: 'demo-fallback'`, `confidence: null` on every candidate, and a notice that states no model analysed the image. It is a labelled fallback, not a simulated success.

## 6. Nutrition Service

The nutrition service retrieves available nutrition data for a confirmed catalogue food and serving estimate.

Responsibilities:

- Retrieve available nutrient values.
- Apply supported serving conversions.
- Preserve source metadata.
- Preserve estimate status.
- Return unknown values as unknown.

Do not calculate unsupported values from guesses.

## 7. Database

Use Supabase PostgreSQL as the selected database service.

The schema lives in `supabase/migrations`. The tables that exist after those migrations run:

| Table | Purpose | Who can read it |
| --- | --- | --- |
| `profiles` | Display name, locale, consent flag | Owner |
| `user_roles` | Granted roles, written by administrators only | Owner, administrators |
| `user_preferences` | Consent-gated age band, life stage, goal, health context | Owner only |
| `food_items` | Catalogue, with a stable `slug` for deep links | Everyone when published |
| `food_nutrition` | Per-serving estimates, unknown nutrients kept `NULL` | Follows `food_items` |
| `diary_entries` | Private saved meals | Owner only |
| `providers` | Kitchens, with `moderation_status` | Everyone when published, plus members |
| `provider_members` | Which account may manage which kitchen | The member, administrators |
| `provider_menu_items` | Menu rows | Everyone when published, plus members |
| `food_submissions` | Proposed catalogue entries | Author, assigned reviewers, administrators |
| `review_assignments` | Which reviewer may see which submission | The reviewer, administrators |
| `food_reviews` | Review decisions | Author of the submission, reviewers, administrators |
| `audit_events` | Moderation trail, written by triggers | Administrators |
| `ai_recognition_requests` | Rate limiting and recognition history | Owner |

Identifiers are UUIDs. `food_items` and `providers` additionally carry a unique human-readable `slug`, so a QR code or deep link stays readable and survives a reseed.

Authorization helpers (`has_role`, `is_provider_member`, `is_provider_owner`, `is_assigned_reviewer`, `owns_submission`) are `security definer` with a pinned `search_path`. Policies call them instead of selecting from the same table they protect, which is what keeps the policies from recursing.

## 8. Authentication and Authorization

Supabase Auth is responsible for authentication.

The backend is responsible for application authorization.

Every protected operation must verify:

- Authenticated user.
- Required role or permission.
- Resource ownership.
- Resource status where applicable.

Do not trust a role supplied by the browser.

Do not allow a provider to access another provider's menu.

Do not allow a user to access another user's diary.

## 9. Storage

Uploaded images should be validated.

Validate:

- File type.
- File size.
- Upload permissions.
- Storage path ownership.

Do not make private uploads publicly accessible by default.

Use signed access where private image access is required.

## 10. Environment Variables

In the Expo client, `apps/mobile/.env`, both public:

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Anything prefixed `EXPO_PUBLIC_` is inlined into the bundle and readable by anyone. `apps/mobile/src/services/supabase/config.ts` rejects a key that looks like `sb_secret_` or decodes to a `service_role` JWT, so a mistaken paste fails loudly at startup instead of shipping.

As Supabase Edge Function secrets, never in a file the client reads:

```
GEMINI_API_KEY=
GEMINI_MODEL=
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are injected into deployed functions by the platform.

## 11. Demo Versus Production

The hackathon demo may use:

- Seeded data.
- Mock recognition.
- Fictional providers.
- Sample review records.
- Simulated analytics.

The application must not claim that mock integrations are production services.

Production hardening, monitoring, backups, legal review, and full security validation are later activities.

## 12. Architecture Rule

Prefer the simplest architecture that supports the demo journeys while preserving clear boundaries between UI, API, data, and external services.
