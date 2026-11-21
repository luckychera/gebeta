# Gebeta — Repository Instructions

## 1. Project Identity

Project name: **Gebeta**

Product: AI-Powered Food Intelligence & Personalized Nutrition Platform.

Initial focus: Ethiopian food intelligence, beginning in Southwestern Ethiopia.

Gebeta helps people:

- Discover Ethiopian and other local foods.
- Identify likely foods from meal images.
- Understand nutrition estimates and their limitations.
- Discover food-provider menus.
- Save confirmed meals to a personal food diary.
- Access food information in a language they understand.

Gebeta also gives food providers tools to publish menus and gives authorized nutrition/food institutions a controlled way to contribute to or review food information.

This repository currently targets a **hackathon demonstration website**, not a complete production platform.

## 2. Product Vision and MVP Boundary

The project proposal describes the long-term product vision.

The MVP requirements document defines the product capabilities and acceptance expectations.

This repository must implement a focused, demonstrable subset of that vision.

Do not attempt to implement every proposed future feature.

### Four platform actors

1. Individual User
2. Food Provider
3. Nutrition/Food Institution
4. Platform Administrator

Do not remove an actor from the product architecture simply because their complete workflow is deferred from the demo.

## 3. Hackathon Demo Objectives

The demo should communicate the following value:

1. A user can discover Ethiopian foods.
2. A user can upload a meal image or use a sample image.
3. Gebeta presents likely food candidates.
4. The user confirms or corrects the selected food.
5. Gebeta displays nutrition estimates with portion basis and source information.
6. The user can save a confirmed meal to a personal diary.
7. A food provider can manage and publish a sample menu.
8. A guest can access a provider's menu through a QR/referral link.
9. An institution reviewer can see a sample food-review workflow.
10. An administrator can demonstrate basic moderation.

The two strongest demonstration journeys are:

- Individual food discovery and scan-to-nutrition.
- Provider menu discovery through QR/referral.

Other actor dashboards should be implemented as smaller supporting demonstrations.

## 4. Technology Decisions

Follow the technology already selected for this repository.

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS, if already configured
- React Router, if already configured
- Existing UI component and icon libraries

### Backend

- Node.js
- Express
- JavaScript or TypeScript according to the existing backend configuration

### Data and platform services

- Supabase-managed PostgreSQL
- Supabase Auth
- Supabase Storage where configured
- Node.js API for application business logic and integrations

### AI

- Use a backend AI adapter.
- Keep external AI credentials on the server.
- Provide a deterministic demo fallback when no AI credentials are configured.

Do not replace the selected architecture without explicit approval.

Do not introduce a second backend framework.

Do not expose Supabase service-role credentials or AI keys in browser code.

## 5. Mandatory Repository Inspection

Before implementing a feature:

1. Inspect the existing repository structure.
2. Read the relevant source files.
3. Inspect package.json scripts and installed dependencies.
4. Inspect existing routes, services, components, and database migrations.
5. Reuse existing conventions.
6. Identify missing functionality before adding code.

Never assume a route, database table, component, hook, or service exists.

Never invent an API endpoint and silently use it from the frontend.

If an endpoint is missing:

- Identify the gap.
- Propose the smallest compatible implementation.
- Implement it in the correct backend layer.
- Update the relevant documentation.

Do not rewrite working modules simply to match a preferred architecture.

## 6. Implementation Principles

- Prefer a small working feature over a large unfinished abstraction.
- Build complete vertical user journeys.
- Keep components reusable but avoid unnecessary abstraction.
- Keep business logic out of React presentation components.
- Keep database access out of UI components.
- Validate inputs at system boundaries.
- Use meaningful TypeScript types.
- Use clear loading, empty, success, and error states.
- Ensure responsive layouts for mobile and desktop.
- Avoid fake buttons and nonfunctional interactions.
- Do not create placeholder pages that look finished but have no behavior.

## 7. Demo Data and Mock Integrations

This is a hackathon demo.

Mock data and mock integrations are permitted when they are clearly identified.

Examples:

- Sample Ethiopian food catalogue.
- Fictional hotels, restaurants, and cafés.
- Demo nutrition references.
- Mock AI recognition results.
- Sample institution reviews.
- Sample analytics.

However:

- Never label mock AI output as a verified real-world recognition.
- Never label fictional providers as real partners.
- Never present demo nutrition data as laboratory measurements.
- Never claim a payment has been completed if no real payment occurred.

Use a consistent demo-data layer so that mock data can later be replaced.

## 8. AI and Nutrition Integrity

Food recognition is probabilistic.

An image cannot reliably establish:

- Exact ingredients.
- Exact cooking oil quantity.
- Recipe proportions.
- Exact serving weight.
- Allergen absence.

The application must:

- Present candidate foods rather than claiming certainty.
- Allow the user to confirm or correct the result.
- Show serving-size assumptions.
- Show nutrition source and verification status.
- Clearly label estimates.
- Preserve unknown values as unknown.

Never invent nutrition values to fill missing data.

Never provide diagnosis, treatment, or medical prescriptions.

Gebeta is a food information and discovery platform, not a replacement for qualified clinical advice.

## 9. Privacy and Permissions

- Users may access only their own private diary and profile.
- Providers may manage only their own provider profile and menus.
- Providers must never access individual users' private diaries or health profiles.
- Institution reviewers may access only assigned submissions and authorized aggregate reports.
- Administrative actions must respect permissions.
- Never place secrets in frontend environment variables.
- Do not collect sensitive health information unless necessary and explicitly consented to.

## 10. UI/UX Rules

Read and follow:

- docs/UI_UX_DESIGN_SYSTEM.md

Preserve the established Gebeta visual identity.

The interface should feel:

- Modern.
- Clean.
- Trustworthy.
- Food-focused.
- Accessible.
- Responsive.

Do not redesign the entire application without a clear reason.

Do not introduce unrelated colors, typography, spacing systems, or component styles.

## 11. Development Workflow

For every assigned task:

1. Understand the requested outcome.
2. Inspect the existing implementation.
3. Identify affected files.
4. Explain important gaps briefly.
5. Implement the smallest complete solution.
6. Run relevant lint, type-check, and tests.
7. Fix errors introduced by the change.
8. Summarize changed files and remaining limitations.

Do not claim tests passed unless they were actually run.

Do not silently skip failing tests.

## 12. Scope Control

Do not implement these as hackathon requirements unless explicitly requested:

- Native Android/iOS applications.
- Live subscription billing.
- Provider commissions.
- Full payment integration.
- POS or inventory integrations.
- Food ordering and reservations.
- Advanced meal planning.
- Clinical nutrition recommendations.
- Advanced portion-weight estimation.
- Production-scale analytics.
- Full professional translation of every screen.
- Complex enterprise multi-branch management.

Keep the architecture extensible, but do not build these features now.

## 13. Definition of Done

A feature is complete only when:

- The user-facing interaction works.
- The interface is responsive.
- Data is handled consistently.
- Loading, empty, and error states exist.
- Access boundaries are respected.
- No fake success state is presented.
- Relevant checks have been run.
- Known limitations are documented.

**Primary instruction: Build a convincing, coherent, working Gebeta demo. Do not turn this hackathon repository into an unnecessarily complex production system.**
