# Gebeta

**AI-powered Food Intelligence and Nutrition Platform**

Gebeta helps hotel guests make informed food choices through
digital menus, food intelligence, and personalized nutrition
recommendations.

## Architecture today, and what comes next

The long-term product is a multi-actor platform for individuals, food providers, nutrition institutions, and platform administrators. The hackathon repository implements a focused subset of that vision in one phase.

**Phase 1 — what runs today**

- Expo + React Native + TypeScript client in `apps/mobile`, served to the browser through an Expo web export.
- On-device persistence with AsyncStorage under the key `gebeta.nutriguider.v1`. There is no account server.
- A local Ethiopian food catalogue in `apps/mobile/src/data/foods.ts`, with illustrative nutrition estimates.
- A deterministic demo recognition adapter in `apps/mobile/src/services/recognition.ts`. No AI model analyses the image.

**Phase 2 — planned, not implemented**

- Node.js and Express API in `backend` (directory is a placeholder today).
- Supabase PostgreSQL for application data.
- Supabase Auth for accounts, sessions, and roles.
- Supabase Storage for uploaded meal images.
- A provider-independent AI recognition adapter behind the same interface as the demo adapter.
- A React + Vite web client in `apps/web`, if the phone-shaped web export is no longer enough.

Nothing in Phase 2 exists in this branch. The app states this in its own screens.

## Mobile and web demo

Gebeta NutriGuider lives in `apps/mobile`.

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

## Project Structure

```text
gebeta/
├── apps/
│   ├── mobile/          Expo client that also builds the web demo
│   └── web/             placeholder for a future React + Vite client
├── backend/             placeholder for the future Express API
├── docs/
├── .cursor/
│   └── rules/
├── AGENTS.md
├── vercel.json          static hosting config for the Expo web export
├── .env.example
├── .gitignore
└── README.md
