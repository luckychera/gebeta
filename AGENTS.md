# Gebeta — Integrated AI Food Intelligence Platform

## 1. Project Mission

Gebeta is an AI-powered Food Intelligence and Nutrition Platform connecting hotels and food providers with guests through digital menus, nutritional information, food discovery, and personalized meal recommendations.

IMPORTANT: Gebeta is a HACKATHON MVP, NOT a static frontend prototype.

We want a working, integrated application with real authentication, persistent database storage, backend APIs, file storage, and AI integration.

Hackathon scope means simplifying implementation and avoiding unnecessary production complexity. It does NOT mean removing essential application functionality.

## 2. Mandatory Architecture

- Frontend: React + TypeScript + Vite.
- Backend: Node.js + Express.
- Database: Supabase-managed PostgreSQL.
- Authentication: Supabase Auth.
- File storage: Supabase Storage.
- AI: Provider-independent backend AI adapter.
- Frontend hosting: Existing Vercel staging and production projects.
- Backend hosting: To be decided separately. Render is postponed.

The Express API owns business logic, protected business operations, complex authorization, and AI orchestration.

The frontend may use Supabase Auth and approved Storage flows, but core business operations must communicate through the Express API.

Do not introduce another database or authentication provider.

## 3. Actors

1. Hotel administrators and staff: manage hotels, menus, meals, ingredients, images, and available nutrition information.
2. Guests/users: discover hotels, browse menus, set dietary preferences and nutrition goals, and receive meal recommendations.
3. Platform administrators: oversee participating hotels and basic platform activity.

AI is a platform capability, not a human actor or account role.

## 4. Required Functional Features

### Authentication
- Registration and login using Supabase Auth.
- Logout and session persistence.
- Protected frontend routes.
- Backend JWT verification using Supabase-issued access tokens.
- Role-based and resource-based authorization.

### Hotel management
- Hotel registration and profile management.
- Hotel dashboard.
- Menu creation and management.
- Meal creation and management.
- Ingredients and portion sizes.
- Prices and available nutrition information.
- Food image uploads.
- Meal availability.

### Guest experience
- Hotel discovery.
- Digital menu browsing.
- Meal details.
- Ingredient and nutrition information.
- Dietary preferences and nutrition goals.
- Personalized meal recommendations.

### AI nutrition
- Backend AI integration through a provider-independent adapter.
- Meal matching based on available food data and guest preferences.
- Recommendation explanations.
- Clearly distinguish provided nutrition data from estimates.
- Never fabricate verified nutrition values.
- Provide a clearly identified fallback when AI credentials are unavailable.

### Platform administration
- Basic platform dashboard.
- Hotel overview and management.
- Statistics calculated from actual database records.

## 5. Database and Storage

Use Supabase PostgreSQL for persistent application data.

Use Supabase Auth for identity.

Use Supabase Storage for hotel and meal images.

Create SQL migrations for the actual schema.

Apply Row Level Security (RLS) and appropriate ownership and access policies.

Never expose the Supabase service-role key in frontend code.

Use realistic seed data for the demonstration. Seed data must be stored in the database, not substituted with frontend-only arrays for core workflows.

## 6. Backend Requirements

Implement real Express REST endpoints.

Use:
- Authentication middleware.
- Authorization middleware.
- Input validation.
- Service and route separation.
- Centralized error handling.
- Environment-based configuration.
- Health-check endpoint.

The frontend must call actual implemented endpoints.

Do not invent API endpoints or create mock API services to simulate unfinished backend functionality.

## 7. Frontend Requirements

Build a polished, responsive application.

Use reusable React components and TypeScript.

Provide separate experiences for guests, hotel administrators, and platform administrators.

Include:
- Authentication pages.
- Guest dashboard.
- Hotel discovery and digital menus.
- Meal details.
- Guest preferences.
- AI recommendations.
- Hotel dashboard.
- Menu and meal management.
- Basic platform administration.

Every important action must communicate with the appropriate backend or Supabase service.

Local UI state is allowed for temporary interface state, but not as a replacement for persistent business data.

## 8. Demo Constraints

Prioritize a working end-to-end demonstration over unnecessary production complexity.

Simplify workflows where reasonable.

Do not spend hackathon time implementing:
- Complex subscription billing.
- Enterprise analytics.
- Unnecessary microservices.
- Elaborate audit systems.
- Native mobile applications.

Do not remove essential authentication, authorization, database, API, or integration functionality.

AI functionality must use a real provider when configured. If unavailable, clearly identify any fallback as a demonstration fallback.

## 9. Security

- Never commit secrets.
- Never expose private AI credentials.
- Never expose the Supabase service-role key to the browser.
- Verify Supabase access tokens in Express.
- Enforce authorization on the backend.
- Protect hotel-specific data from other hotels.
- Apply RLS to database tables.
- Validate incoming requests.

## 10. Development Workflow

Before changing code:
1. Inspect the repository and existing implementation.
2. Read package files, source code, migrations, and documentation.
3. Identify what exists and what is missing.
4. Preserve working code and user changes.
5. Produce a concise implementation plan.

Then continue implementing. Do not stop at documentation or planning.

Work in complete vertical slices: frontend, API, database, and authorization must work together.

Run available lint, type-check, tests, and builds. Never claim success without executing the relevant command.

If external credentials are missing, implement the integration structure, document the required environment variables, and continue with independent work.

## 11. Documentation

Maintain documentation that reflects the actual implementation:
- docs/DEMO_SCOPE.md
- docs/ARCHITECTURE.md
- docs/DATABASE.md
- docs/API_CONTRACT.md
- docs/BUILD_PLAN.md
- docs/DEMO_DATA.md

Do not document nonexistent endpoints or claim unfinished features are implemented.

## 12. Acceptance Criteria

The demonstration should support this complete workflow:

1. A hotel administrator registers and logs in.
2. The administrator manages a hotel.
3. The administrator creates menus and meals.
4. The administrator adds ingredients, prices, available nutrition information, and images.
5. A guest registers and logs in.
6. The guest discovers the hotel and browses its menu.
7. The guest views meal details.
8. The guest saves dietary preferences and nutrition goals.
9. The guest receives personalized meal recommendations with explanations.
10. A platform administrator can view participating hotels.

All core business data must persist in Supabase PostgreSQL.

Authentication must use Supabase Auth.

Protected business operations must use the Express API.

The final result must be an integrated, functional hackathon MVP.
