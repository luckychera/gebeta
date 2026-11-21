# Gebeta — Hackathon Demo Scope

Version: 1.1
Status: Implementation baseline

## 0. Delivered Demo and Accepted Deviations

This section records what the hackathon branch delivers. Section 2 onward is the original plan, kept for reference.

The demo is delivered as an **Expo client exported to the web**, not as a separate React and Vite website. One codebase serves the browser demo and a phone-capable client. The client talks to a real Supabase project: Auth for accounts, PostgreSQL for data, Storage for images, and one edge function for the Gemini call. See `docs/ARCHITECTURE.md` section 0.

What is real rather than simulated:

- **Accounts.** Supabase Auth with email and password, email confirmation, a persisted session, and sign out.
- **Data.** Catalogue, diary, profile, preferences, providers, menus, submissions, and reviews are PostgreSQL rows. Every table has row level security, so a diary entry is unreachable by anyone but its owner even with a crafted request.
- **Roles.** Provider, institution, and administrator capabilities come from `user_roles` and `provider_members`, granted in the database. Hiding a button is not what stops an unauthorized write; the policy is.
- **Images.** Catalogue images are public; user uploads go to a private bucket under a path keyed to the user's id and are read through short-lived signed URLs. Keeping an uploaded photo is off by default and requires an explicit switch.
- **Recognition.** Google Gemini, called from the `recognize-food` edge function so the key never reaches the browser.

Deviations accepted for this demo:

- **No public desktop website.** The web export is a phone-width column, framed and centred on large screens. It is responsive in the sense that it works on both, not in the sense of a distinct desktop layout.
- **No Express tier.** Authorization lives in row level security instead of API handlers. `backend/` is still empty.
- **Nutrition is illustrative.** Seeded values are labelled `illustrative-demo` with a serving basis and a source. Unknown nutrients stay `NULL` and display as unknown. Gemini is forbidden from supplying nutrition at all.
- **Recognition without a key is a labelled fallback.** If `GEMINI_API_KEY` is not set, or the call fails, the app matches against the catalogue and states on screen that no model analysed the image. It never presents the fallback as an AI result.
- **Recommendations are preference filters only.** Vegetarian, no-raw-meat, and high-protein preferences filter the catalogue. Age, gender, activity, a weight goal, pregnancy or breastfeeding, and a diabetes or blood pressure note are stored as context and shown as context. They never rank or restrict dishes, because that would be clinical advice the demo cannot support.
- **Provider QR uses the real public route.** The code encodes the deployed web URL for `/provider/{slug}` when a web origin is available, and falls back to the `gebeta://` app link otherwise.
- **Signed out, the app still runs.** It uses the bundled catalogue and on-device storage, clearly marked as on-device. Local data is never uploaded over account data on sign-in.

Still open at the end of the hackathon branch:

- Role grants are a manual database step. There is no administrator screen for granting a role or adding a provider member.
- Admin moderation covers provider status plus the audit list. Users are not listed.
- Provider menus support add, edit, and publish or unpublish. There is no allergen field and no provider-profile editing.
- Password reset and account deletion are not built.

## 1. Purpose

This document defines what the Gebeta hackathon demonstration website should contain.

The project proposal describes the complete product vision. The MVP requirements document describes broader functional expectations.

This document narrows those expectations into a realistic, demonstrable implementation.

The objective is to demonstrate the value of Gebeta through working user journeys, not to simulate a fully operational commercial platform.

## 2. Demo Strategy

Build a responsive web application with role-based experiences.

Prioritize two complete journeys:

1. Individual food discovery and AI-assisted scan.
2. Food-provider menu discovery through QR/referral.

Supporting demonstrations:

- Food diary.
- Provider dashboard.
- Institution review.
- Admin moderation.

Use clearly labelled sample data and mock integrations where necessary.

## 3. Actor Experiences

### A. Individual User

Priority: P0 — Core demo

The user should be able to:

- Visit the public Gebeta website.
- Explore the food catalogue.
- Search for Ethiopian foods.
- Open a food detail page.
- Upload a meal image or select a demo image.
- View suggested food candidates.
- Confirm or correct the identified food.
- Select or adjust a serving estimate.
- View nutrition estimates.
- See nutrition source and estimate labels.
- Save a confirmed meal.
- View saved meals in a simple diary.

Minimum demonstration:

A user uploads a photo of a meal, receives a likely food match, confirms it, sees nutrition information, and saves it.

### B. Food Provider

Priority: P0 — Core demo

The provider should be able to:

- Open a provider dashboard.
- View a sample provider profile.
- View menu items.
- Add a menu item.
- Edit a menu item.
- Publish or unpublish a menu item.
- View a public provider menu.
- Access a QR/referral page.

Minimum demonstration:

A provider publishes a menu item. A guest opens the provider menu through a QR/referral link.

### C. Nutrition/Food Institution

Priority: P1 — Supporting demo

The institution reviewer should be able to:

- View a sample review queue.
- Open a food submission.
- Inspect its nutrition information and sources.
- Mark the submission as approved, rejected, or requiring changes.
- View the review status.

Minimum demonstration:

A reviewer opens a sample food submission and changes its review status.

If time is limited, use seeded demo submissions and a simple status-update interaction.

### D. Platform Administrator

Priority: P1 — Supporting demo

The administrator should be able to:

- View a dashboard summary.
- View sample users and providers.
- View food catalogue submissions.
- Review provider verification status.
- Change a sample moderation status.
- View a basic audit/activity list.

Minimum demonstration:

An administrator changes a provider or food-record status.

Do not build a complex enterprise administration system.

## 4. Public Website

Priority: P0

Required pages:

- Home
- Food discovery
- Food detail
- Provider directory
- Provider public menu
- Login/register entry
- About or how it works

The homepage should explain:

- What Gebeta does.
- Why Ethiopian food intelligence matters.
- How image-assisted food recognition works.
- How providers benefit.
- How users access the platform.

## 5. Food Catalogue

Priority: P0

Start with a small curated dataset of representative Ethiopian dishes.

Each food record should support:

- ID
- Name
- Alternative/local names where available
- Description
- Category
- Image
- Serving basis
- Energy estimate
- Available macronutrients
- Nutrition source
- Estimate/verification status
- Assumptions or notes

Do not fabricate missing nutrition information.

Use sample values only when their source or demo status is disclosed.

## 6. AI-Assisted Scan

Priority: P0

The demo flow:

1. User selects or uploads an image.
2. Application validates the image.
3. Application requests candidate foods from the recognition service.
4. The service returns one or more likely candidates.
5. User confirms or corrects the candidate.
6. User selects a serving estimate.
7. Application retrieves nutrition information.
8. Application displays estimates and their source.
9. User may save the confirmed meal.

### Demo fallback

If no AI service is configured:

- Use a deterministic mock recognition adapter.
- Return candidates from the local demo catalogue.
- Clearly identify the result as a demo/mock result.
- Keep the same interface contract as the future real AI provider.

Never display a fake loading animation followed by a fabricated claim that a real AI model analyzed the image.

## 7. Food Diary

Priority: P1

The user can:

- Save a confirmed meal.
- View saved meals.
- See date and serving estimate.
- Delete a diary entry.

Diary entries are private to the individual user.

For a frontend-only demo, local demo persistence may be used, but the UI must not claim that the data is securely stored in a production account.

## 8. Provider Menu and QR

Priority: P0

Provider menu items should include:

- Food name
- Description
- Image
- Price, when available
- Serving information
- Ingredients, when confirmed
- Allergen information, when confirmed
- Nutrition information, when available
- Publication status

QR/referral behavior:

- Generate or display a QR code for a provider menu URL.
- Opening the URL displays the public provider menu.
- A referral/campaign identifier may be recorded in the demo.
- Direct access to Gebeta must remain possible without a QR code.

A QR code must not imply a confirmed partnership with a real hotel or restaurant.

## 9. Institution Review

Priority: P1

Implement a simplified review workflow:

- Submission list.
- Submission detail.
- Source/reference information.
- Review status.
- Reviewer note.
- Approve/reject/request changes.

Use fictional demo submissions unless real authorized data is provided.

## 10. Admin Moderation

Priority: P1

Implement a simple admin view for:

- Users.
- Providers.
- Food catalogue records.
- Pending review items.
- Activity/audit events.

Keep actions limited to the demo's moderation needs.

## 11. Priorities

### P0 — Must work in the demo

- Responsive public website.
- Food catalogue.
- Food search.
- Food detail.
- Image upload or demo image selection.
- Candidate food result.
- User confirmation/correction.
- Nutrition result with transparent estimate/source information.
- Provider profile and menu.
- Provider QR/referral access.

### P1 — Implement after P0 works

- Basic food diary.
- Optional preferences.
- Institution review view.
- Admin moderation.
- Basic in-app notices.
- Demo analytics.

### P2 — Post-hackathon

- Production authentication and account recovery.
- Production AI recognition.
- Full institutional onboarding.
- Full provider verification.
- Real subscription billing.
- Payment integrations.
- Advanced recommendations.
- Native mobile applications.
- Full multilingual content.
- Advanced analytics and reporting.

P2 features must not block the hackathon demonstration.

## 12. Demo Data Rules

- Use fictional provider names unless a real provider has authorized use.
- Use a small curated food dataset.
- Identify mock AI results.
- Identify demo nutrition values.
- Do not present sample analytics as real customer activity.
- Do not expose private user information in sample dashboards.

## 13. Demo Acceptance Checklist

- [ ] Website works on mobile and desktop.
- [ ] User can browse foods.
- [ ] User can search foods.
- [ ] User can upload or select a sample image.
- [ ] Candidate result is displayed.
- [ ] User can confirm or correct the candidate.
- [ ] Nutrition result displays serving basis and source.
- [ ] User can save a confirmed meal.
- [ ] Provider can view and manage sample menu items.
- [ ] Public provider menu works.
- [ ] QR/referral URL opens the correct menu.
- [ ] Institution reviewer can update a submission status.
- [ ] Administrator can demonstrate basic moderation.
- [ ] Mock data and integrations are clearly labelled.
