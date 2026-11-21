# Gebeta — Demo Data Specification

Version: 1.0

## 1. Purpose

Define a small, consistent dataset for the Gebeta hackathon demonstration.

All fictional records must be clearly understood as demo data.

## 2. Food Catalogue

Create approximately 10–20 representative food records.

Prioritize Ethiopian dishes and meals relevant to the initial Southwestern Ethiopia focus.

Suggested categories:

- Traditional Ethiopian meals.
- Bread and breakfast.
- Meat-based dishes.
- Vegetarian dishes.
- Drinks.
- Snacks.

Potential examples to research and validate before adding:

- Injera.
- Doro Wat.
- Shiro.
- Misir Wat.
- Tibs.
- Firfir.
- Genfo.
- Chechebsa.
- Kinche.
- Gomen.

Do not assume that every dish has a single standardized recipe.

## 3. Food Record Structure

Each food record should support:

- id
- name
- alternativeNames
- description
- category
- image
- servingDescription
- servingWeightGrams, if supported
- energyKcal, if supported
- proteinGrams, if supported
- carbohydrateGrams, if supported
- fatGrams, if supported
- fibreGrams, if supported
- nutritionSource
- verificationStatus
- assumptions
- createdAt
- updatedAt

Unknown nutrition fields must remain null or otherwise explicitly unavailable.

## 4. Provider Demo Records

Create 2–3 fictional providers.

Suggested provider types:

- Hotel.
- Restaurant.
- Café.

Each provider may have:

- id
- name
- description
- locationLabel
- logo/image
- contact information marked as fictional
- publication status
- menu items
- QR/referral URL

Do not use a real business identity without authorization.

## 5. Menu Items

Each menu item should support:

- id
- providerId
- foodId, when matched to catalogue
- name
- description
- image
- price
- currency
- servingDescription
- ingredients, when confirmed
- allergenInformation, when confirmed
- nutritionInformation, when available
- publicationStatus

Provider-submitted data must not automatically be labelled institution-verified.

## 6. Institution Demo Records

Create a few sample submissions.

Each submission should include:

- Food name.
- Submitted information.
- Source/reference.
- Submitter.
- Review status.
- Reviewer note.
- Review date.

Use fictional institutions and reviewers.

## 7. Admin Demo Records

Provide sample:

- Users.
- Providers.
- Pending food submissions.
- Moderation events.
- Activity records.

Do not include real personal information.

## 8. Demo Data Consistency

The same food should have consistent names and identifiers across:

- Food catalogue.
- Scan candidates.
- Nutrition results.
- Provider menu.
- Food diary.
- Institution review.

Avoid maintaining duplicate conflicting versions of the same food in unrelated frontend components.

## 9. Demo Labeling

Use labels such as:

- Sample data.
- Demo provider.
- Demo recognition.
- Estimated nutrition.
- Provider supplied.
- Pending review.

Do not present demo records as confirmed real-world partnerships or research results.
