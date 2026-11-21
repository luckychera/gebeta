# Gebeta — Database Guidelines

Version: 1.0

## 1. Database Choice

Use the existing Supabase PostgreSQL database configuration.

Do not introduce another database.

## 2. Important Rule

The entities below describe the intended product data model.

They do not confirm that these tables already exist.

Before creating migrations:

1. Inspect the existing Supabase directory.
2. Inspect all existing migrations.
3. Inspect the current schema.
4. Identify reusable tables.
5. Avoid duplicate or conflicting migrations.

## 3. Core Entities

### profiles

Application profile linked to the authenticated user.

Potential fields:

- id
- full_name
- avatar_url
- preferred_language
- created_at
- updated_at

### user_preferences

Optional user preferences.

Potential fields:

- id
- user_id
- dietary_preferences
- food_dislikes
- goals
- created_at
- updated_at

Sensitive health context must not be required for basic food discovery.

### food_items

Curated food catalogue.

Potential fields:

- id
- name
- description
- category_id
- image_url
- alternative_names
- serving_description
- verification_status
- created_at
- updated_at

### food_nutrition

Nutrition reference information.

Potential fields:

- id
- food_id
- serving_basis
- serving_weight_grams
- energy_kcal
- protein_g
- carbohydrates_g
- fat_g
- fibre_g
- source_name
- source_reference
- estimate_status
- assumptions
- reviewed_at

Allow unavailable values.

### food_scans

Records a scan request.

Potential fields:

- id
- user_id
- image_path
- recognition_provider
- status
- created_at

### scan_candidates

Candidate results for a scan.

Potential fields:

- id
- scan_id
- food_id
- confidence
- selected_by_user
- created_at

### diary_entries

Private user meal history.

Potential fields:

- id
- user_id
- food_id
- serving_description
- serving_weight_grams
- consumed_at
- notes
- created_at

### providers

Food-provider profile.

Potential fields:

- id
- owner_user_id
- name
- description
- provider_type
- location_label
- image_url
- verification_status
- publication_status
- created_at
- updated_at

### provider_menu_items

Provider-owned menu records.

Potential fields:

- id
- provider_id
- food_id
- name
- description
- image_url
- price
- currency
- ingredients
- allergen_information
- nutrition_information
- publication_status
- created_at
- updated_at

### institutions

Authorized institution records.

### food_submissions

Food information submitted for review.

### food_reviews

Review decisions and reviewer notes.

### referrals

Provider QR/referral attribution records.

### audit_events

Administrative and moderation activity.

## 4. Ownership Rules

- A user owns their profile, preferences, and diary entries.
- A provider owns its provider profile and menu records.
- An institution accesses only authorized submissions and review records.
- Administrators receive only the permissions required for their responsibilities.

## 5. Row-Level Security

Where Supabase client access is used, configure appropriate Row-Level Security policies.

Policies must prevent:

- Users reading another user's diary.
- Providers modifying another provider's menu.
- Unapproved users modifying institution reviews.
- Ordinary users accessing administrative data.

Do not rely only on frontend route protection.

The backend must enforce authorization for protected business operations.

## 6. Migration Rules

- Use versioned SQL migrations.
- Do not modify an already-applied migration casually.
- Prefer a new migration for schema changes.
- Add appropriate foreign keys and indexes.
- Avoid unnecessary columns.
- Keep seed/demo data separate from schema migrations.
- Never put production secrets in SQL files.

## 7. Hackathon Simplification

Implement only the tables needed for the selected demo journeys.

If the repository already uses a different but compatible schema, reuse it rather than creating a parallel schema.
