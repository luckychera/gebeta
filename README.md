# Gebeta

**AI-powered Food Intelligence and Nutrition Platform**

Gebeta helps hotel guests make informed food choices through
digital menus, food intelligence, and personalized nutrition
recommendations.

## Architecture

- React + TypeScript — Web frontend (`apps/web`, not built yet)
- React Native + Expo + TypeScript — Mobile demo (`apps/mobile`)
- Node.js + Express — Backend API (`backend`, not built yet)
- Supabase — PostgreSQL, Authentication, and Storage (planned)
- Provider-independent AI architecture

## Mobile demo

Gebeta NutriGuider lives in `apps/mobile`. The repository does not yet ship an Express API, so the app uses the local catalogue, a labelled demo recognition flow, and on-device storage.

```bash
cd apps/mobile
npm install
npm test
npm run typecheck
npx expo start
```

## Project Structure

```text
gebeta/
├── apps/
│   └── web/
├── backend/
├── docs/
├── supabase/
│   ├── migrations/
│   └── seed/
├── tests/
├── .cursor/
│   └── rules/
├── AGENTS.md
├── .env.example
├── .gitignore
└── README.md
