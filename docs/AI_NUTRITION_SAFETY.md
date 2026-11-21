# Gebeta — AI and Nutrition Safety Rules

Version: 1.0

## 1. Purpose

Define how Gebeta handles AI-generated food recognition and nutrition information.

The application must be useful without presenting uncertain information as fact.

## 2. Food Recognition

A food image can suggest likely food candidates.

It cannot reliably establish:

- Exact ingredients.
- Exact cooking oil quantity.
- Exact recipe proportions.
- Exact serving weight.
- Whether an allergen is absent.

The system must not claim certainty based only on an image.

## 3. Recognition Workflow

1. Receive an uploaded or selected image.
2. Validate the image.
3. Request likely food candidates.
4. Match candidates against the Gebeta food catalogue.
5. Display candidate results.
6. Allow the user to confirm or correct the result.
7. Retrieve nutrition data for the confirmed food.
8. Display the nutrition estimate and its limitations.

If no suitable candidate exists, offer manual food search.

## 4. Recognition Status Labels

Use distinct labels:

- AI-identified
- Catalogue-matched
- Provider-registered
- Institution-verified
- Demo result

Do not use "verified" for an AI prediction.

## 5. Nutrition Display

Where available, display:

- Food name.
- Serving size or serving basis.
- Calories/energy.
- Protein.
- Carbohydrates.
- Fat.
- Fibre.
- Available micronutrients.
- Nutrition source.
- Verification status.
- Assumptions and limitations.

Do not display missing values as zero.

Do not invent values to make a nutrition card look complete.

## 6. Estimate Transparency

Nutrition values must be labelled according to their source:

- Generic catalogue estimate.
- Provider-supplied information.
- Institution-reviewed information.
- Demo/sample information.

When a serving estimate is used, show the serving basis.

If the calculation depends on an assumption, disclose it.

## 7. Allergen Safety

- Do not claim an allergen is absent when ingredient information is incomplete.
- Display allergen information only when supported by confirmed ingredient data.
- Explain when allergen information is unavailable.
- Encourage users with serious allergies to confirm directly with the provider.

## 8. Health Guidance

Gebeta is not a medical diagnosis or treatment platform.

Do not:

- Diagnose diseases.
- Prescribe diets.
- Recommend stopping medication.
- Promise disease prevention or treatment.
- Present general food suggestions as clinical advice.

Sensitive health information must remain optional and consent-based.

Pregnancy, chronic disease, and child nutrition content requires qualified review before being presented as authoritative guidance.

Do not apply adult BMI categories to children.

## 9. Demo AI Behavior

When no real recognition provider is configured:

- Use a mock recognition adapter.
- Return deterministic sample candidates.
- Label the result as a demo result.
- Do not claim a real AI model analyzed the image.
- Keep the same interface contract intended for a real recognition provider.

## 10. Example User-Facing Disclaimer

"Food recognition and nutrition values are estimates. Actual ingredients, preparation methods, and portion sizes may differ. Confirm important ingredient and allergen information directly with the food provider."

## 11. Engineering Rules

- Keep AI credentials on the backend.
- Validate AI responses before using them.
- Handle timeouts and provider errors.
- Provide a manual search fallback.
- Log technical failures without exposing private user data.
- Do not store uploaded images longer than necessary for the selected workflow.
