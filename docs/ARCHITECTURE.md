# Gebeta — Demo Architecture

Version: 1.0
Status: Hackathon implementation baseline

## 1. Architecture Goal

Build a responsive web application with a modular backend and a clear path toward a larger platform.

The hackathon implementation should remain simple.

Do not introduce infrastructure that is not required to demonstrate the product.

## 2. Selected Technology

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

Conceptual interface:

recognizeFood({
image,
locale,
context
})

Expected result:

{
status: "matched" | "no_match" | "unavailable",
provider: "mock" | "external",
candidates: [
{
foodId: "food-id",
label: "Food name",
confidence: 0.0
}
]
}

This is a conceptual contract. Inspect the existing implementation before creating or changing actual types.

### Demo mode

When AI credentials are absent:

- Use a deterministic mock adapter.
- Return candidates from the demo catalogue.
- Label the result as a demo recognition.
- Preserve the same result structure as the future external adapter.

Do not call external AI services from browser code.

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

Potential core entities:

- profiles
- user_preferences
- food_items
- food_categories
- food_nutrition
- food_scans
- scan_candidates
- diary_entries
- providers
- provider_menu_items
- institutions
- food_submissions
- food_reviews
- referrals
- audit_events

These are conceptual entities, not confirmation that tables already exist.

Before adding migrations:

1. Inspect existing Supabase migrations.
2. Inspect the current database schema.
3. Reuse existing naming conventions.
4. Avoid duplicate tables.
5. Add only the schema needed for the demo.

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

Use environment variables for configuration.

Examples of possible server-side variables:

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AI_PROVIDER_API_KEY=
AI_PROVIDER_MODEL=

These are examples only. Inspect existing configuration before adding or renaming variables.

Never expose service-role or AI credentials through Vite's public environment variables.

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
