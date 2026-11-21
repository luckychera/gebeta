# Gebeta — Product Requirements

Version: 1.0
Source baseline: Gebeta MVP Definition & Software Requirements Specification v1.1
Product status: Hackathon demo implementation

## 1. Product Overview

Gebeta is an AI-powered food intelligence and personalized nutrition platform.

It connects:

- Individuals who want to understand and discover food.
- Food providers who want to publish accessible menus.
- Nutrition/food institutions that contribute to or review food information.
- Platform administrators who maintain data quality and platform integrity.

The initial focus is Ethiopian food intelligence, beginning in Southwestern Ethiopia.

## 2. Product Objectives

1. Make local food information easier to discover.
2. Help users identify likely foods from images.
3. Present understandable nutrition estimates.
4. Make nutrition data sources and uncertainty transparent.
5. Help food providers publish digital menus.
6. Support controlled institutional contribution and review.
7. Build a foundation for multilingual food education.

## 3. Actors

### Individual User

Can:

- Browse public foods and provider menus.
- Search food records.
- Submit meal images.
- Confirm or correct likely food matches.
- View available nutrition estimates.
- Manage optional preferences.
- Save and manage personal diary entries.

Cannot:

- Access another user's diary.
- Access private provider management functions.
- Access institution or admin functions without explicit authorization.

### Food Provider

Can:

- Manage their own provider profile.
- Create and edit their own menu items.
- Publish and unpublish menu items.
- View permitted menu/referral statistics.
- Share public menu links and QR codes.

Cannot:

- Access individual user diaries.
- Access private health profiles.
- Modify another provider's records.

### Nutrition/Food Institution

Can:

- Submit food information.
- Review assigned submissions.
- Provide sources and review notes.
- Access approved aggregate reports where authorized.

Cannot:

- Access private individual diaries.
- Access unassigned review records.
- Change platform administration settings.

### Platform Administrator

Can:

- Manage platform roles and permissions.
- Moderate provider records.
- Moderate food catalogue records.
- Review platform activity.
- Manage authorized platform settings.

Administrative actions should be auditable.

## 4. Functional Requirements

### Identity and Access

FR-AUTH-01: The system shall support account registration with validation.

FR-AUTH-02: The system shall support secure sign-in and sign-out.

FR-AUTH-03: The system shall provide an account recovery flow.

FR-AUTH-04: The system shall associate accounts with explicitly granted roles.

FR-AUTH-05: The system shall deny protected operations when a session is missing, expired, or unauthorized.

FR-AUTH-06: Users should be able to update permitted profile fields and communication preferences.

### Individual User

FR-USER-01: Users shall view and edit their own profile.

FR-USER-02: Users shall browse the food catalogue.

FR-USER-03: Users shall search food records.

FR-USER-04: Users shall upload or select a meal image.

FR-USER-05: The system shall return likely food candidates or a no-match result.

FR-USER-06: Users shall confirm or correct a candidate.

FR-USER-07: Users shall manually search for a food when image recognition fails.

FR-USER-08: Users shall select or adjust a serving estimate.

FR-USER-09: The system shall display available nutrition estimates with serving basis, source, assumptions, and uncertainty.

FR-USER-10: Users shall save confirmed meals to their own diary.

FR-USER-11: Users shall view and delete their own diary entries.

FR-USER-12: Food preferences and goals should be optional.

### Food Provider

FR-PROVIDER-01: A provider shall manage its own profile.

FR-PROVIDER-02: A provider shall create menu items.

FR-PROVIDER-03: A provider shall edit its own menu items.

FR-PROVIDER-04: A provider shall publish and unpublish menu items.

FR-PROVIDER-05: Menu items should support images, descriptions, prices, portions, and available ingredient/allergen/nutrition information.

FR-PROVIDER-06: A provider should have a public menu page.

FR-PROVIDER-07: A provider should have a QR/referral link.

FR-PROVIDER-08: Referral attribution should not be required for direct platform access.

### Nutrition/Food Institution

FR-INST-01: Authorized institutions should submit food information.

FR-INST-02: Authorized reviewers should view assigned submissions.

FR-INST-03: Reviewers should approve, reject, or request changes.

FR-INST-04: Reviews should record reviewer, date, status, source, and notes.

FR-INST-05: Institutions may access authorized aggregate reports only.

### Platform Administration

FR-ADMIN-01: Administrators shall manage permitted user and provider statuses.

FR-ADMIN-02: Administrators shall moderate food catalogue records.

FR-ADMIN-03: Administrators shall manage authorized roles and permissions.

FR-ADMIN-04: Administrative actions should create audit events.

FR-ADMIN-05: Administrators should view basic platform activity.

## 5. Nutrition Data Requirements

Every displayed nutrition record should include, where available:

- Food identity.
- Serving basis.
- Energy.
- Protein.
- Carbohydrates.
- Fat.
- Fibre.
- Available micronutrients.
- Source/reference.
- Estimate status.
- Assumptions and notes.

Do not require all nutrient fields to be present.

Missing values must remain unknown rather than being fabricated.

## 6. Recognition Status

The system should distinguish:

- AI-identified: a model proposed a likely food.
- Catalogue-matched: the candidate matches a Gebeta catalogue entry.
- Provider-registered: the food appears in a provider's menu.
- Institution-verified: a qualified reviewer reviewed the relevant information under a defined process.

These labels are not interchangeable.

## 7. Non-Functional Requirements

### Usability

- Responsive layouts for mobile and desktop.
- Clear navigation.
- Accessible labels and controls.
- Useful loading, empty, and error states.

### Security

- Server-side authorization.
- Secure credential handling.
- Validated uploads and API inputs.
- Rate limiting for sensitive endpoints.
- No secrets in frontend bundles.

### Privacy

- Personal diaries are private by default.
- Providers cannot view personal diaries or health profiles.
- Institution reports must be appropriately aggregated.
- Sensitive profile fields are optional and consent-based.

### Performance

The source requirements document proposes service-level targets, including API p95 response time and scan latency targets. These are proposed acceptance targets, not existing performance claims. Validate them against actual hosting, AI provider, and demo conditions.

## 8. Out of Scope for Hackathon

- Native mobile apps.
- Live subscription billing.
- Production payment processing.
- Advanced meal planning.
- Clinical nutrition services.
- POS and inventory integration.
- Food ordering and reservations.
- Advanced portion-weight estimation.
- Full multilingual translation coverage.
- Production-scale analytics.

## 9. Acceptance Principles

A feature is acceptable when:

- Its expected user journey works.
- The user can understand its state.
- Errors are handled.
- Access restrictions are enforced where relevant.
- Displayed data is not misleading.
- Demo limitations are clearly disclosed.
