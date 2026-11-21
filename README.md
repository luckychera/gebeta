# Gebeta

**AI-powered Food Intelligence and Nutrition Platform**

Gebeta helps hotel guests make informed food choices through
digital menus, food intelligence, and personalized nutrition
recommendations.

## Architecture

The long-term product is a multi-actor platform for individuals, food providers, nutrition institutions, and platform administrators. This repository implements a focused subset of that vision.

**Implemented in this branch**

- Expo + React Native + TypeScript client in `apps/mobile`, served to the browser through an Expo web export.
- Supabase Auth with email and password: registration, email confirmation, sign in, sign out, session persistence, and an auth state listener.
- Supabase PostgreSQL as the system of record, defined by the migrations in `supabase/migrations`, with row level security on every table.
- Supabase-backed repositories for the food catalogue, the private diary, the user profile and consent-gated preferences, provider listings, provider menu management, and the institution submission and review workflow.
- Supabase Storage buckets for curated catalogue images (public) and user food uploads (private, owner-scoped paths, signed-URL reads).
- Google Gemini image recognition through the `recognize-food` Supabase Edge Function. The API key is a function secret and never reaches the client.
- An on-device fallback. Without Supabase configured, or when signed out, the app runs from the bundled sample catalogue and AsyncStorage, and says so on screen.

**Not implemented**

- The Node.js and Express API in `backend`. Business logic currently lives in the Expo client and the database, with one edge function for the AI call. `backend/` is still a placeholder.
- A React + Vite web client in `apps/web`. The browser demo is the Expo web export.
- Payments, ordering, delivery, and provider billing.

## Setup

### 1. Client environment

Create `apps/mobile/.env` from `.env.example`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

Only the publishable key belongs here. Gebeta inspects the key at startup and refuses to create a client if it looks like a secret or service-role key, because such a key bypasses row level security.

### 2. Database

Run the files in `supabase/migrations` in order, either with the Supabase CLI (`supabase db push`) or by pasting each file into the SQL editor in the dashboard:

| File | What it creates |
| --- | --- |
| `20261121090000_init_schema.sql` | Tables, indexes, constraints, authorization helpers, and triggers |
| `20261121090100_rls_policies.sql` | Row level security and every access policy |
| `20261121090200_storage.sql` | The `catalogue-images` and `food-uploads` buckets and their policies |
| `20261121090300_seed_demo_data.sql` | Labelled illustrative foods, nutrition, and two fictional providers |
| `20261121090400_tighten_anon_grants.sql` | Reduces the anonymous role to read-only on the four public tables |

Every statement is additive. Nothing is dropped and re-running a file does not overwrite later edits.

### 3. Gemini recognition (optional)

```bash
supabase secrets set GEMINI_API_KEY=your_key
supabase secrets set GEMINI_MODEL=gemini-2.5-flash   # optional
supabase functions deploy recognize-food
```

Without this the scan screen still works and says plainly that it is using the labelled demo fallback.

### 4. Run

```bash
cd apps/mobile
npm install
npm test
npm run typecheck
npx expo start
```

### Web export

```bash
cd apps/mobile
npm run export:web      # expo export --platform web, output in apps/mobile/dist
npx serve -s dist -l 8090
```

The export is a single-page build, so a static host must rewrite unknown paths to `index.html`. `vercel.json` in the repository root does that, which keeps routes such as `/provider/kafa-terrace` working on refresh and when opened from a QR code.

Set `EXPO_PUBLIC_WEB_BASE_URL` to the deployed origin if you want native builds to encode the public browser URL in provider QR codes. On the web the app uses `window.location.origin` automatically. This value is a public address, not a secret.

## Security model

Authorization is decided by the database, not by which buttons a screen shows.

- A user reads and writes only their own `profiles`, `user_preferences`, and `diary_entries` rows, matched on `auth.uid()`.
- Health context is consent-gated and lives in `user_preferences`, which has no policy for providers, reviewers, or administrators. Clearing consent fires a trigger that erases the stored values rather than hiding them.
- Anonymous visitors read published `food_items`, `food_nutrition`, `providers`, and `provider_menu_items`, and nothing else.
- A provider may manage a kitchen only through a row in `provider_members`. A trigger blocks a provider from changing its own `moderation_status`.
- An institution reviewer sees a submission only through `review_assignments`, and may write a review only for an assigned submission.
- Roles live in `user_roles`, which users can read for themselves and only an administrator can write. A role sent by the client is never trusted.

## Project Structure

```text
gebeta/
├── apps/
│   ├── mobile/          Expo client that also builds the web demo
│   └── web/             placeholder for a future React + Vite client
├── backend/             placeholder for the future Express API
├── supabase/
│   ├── migrations/      schema, row level security, storage, demo seed
│   ├── functions/       recognize-food edge function (Gemini)
│   └── config.toml
├── docs/
├── .cursor/
│   └── rules/
├── AGENTS.md
├── vercel.json          static hosting config for the Expo web export
├── .env.example
├── .gitignore
└── README.md
