# Gebeta — API Contract

Version: 1.0
Status: Proposed interface reference

## 1. Purpose

Define the API capabilities needed by the Gebeta demo.

This document is not proof that the listed endpoints have been implemented.

Cursor must inspect the existing backend and preserve existing route conventions.

Do not create duplicate endpoints.

## 2. API Conventions

Suggested base path:

/api/v1

Use JSON responses.

Suggested success structure:

{
"success": true,
"data": {}
}

Suggested error structure:

{
"success": false,
"error": {
"code": "VALIDATION_ERROR",
"message": "A useful error message"
}
}

Use appropriate HTTP status codes.

Validate all request inputs.

Do not return internal stack traces to clients.

## 3. Authentication

Authentication is provided through the selected Supabase Auth integration.

Potential responsibilities:

- Obtain current authenticated user.
- Validate session.
- Load permitted application profile and role information.
- Enforce permissions on protected operations.

Do not create a separate password system unless explicitly approved.

## 4. Food Catalogue

Proposed capabilities:

GET /api/v1/foods

GET /api/v1/foods/:foodId

GET /api/v1/foods/categories

Query capabilities may include:

- search
- category
- page
- limit

## 5. Food Recognition

Proposed capability:

POST /api/v1/scans

Input:

- Image upload or supported image reference.
- Optional locale/context.

Expected behavior:

- Validate image.
- Invoke recognition adapter.
- Match candidate foods to the catalogue.
- Return candidate results or no-match.

The response must identify whether the provider is mock or external.

## 6. Nutrition

Proposed capability:

GET /api/v1/foods/:foodId/nutrition

Optional serving information may be supplied according to the implemented API design.

Return:

- Available nutrient values.
- Serving basis.
- Source.
- Estimate status.
- Assumptions.

Do not invent unavailable nutrient values.

## 7. Food Diary

Proposed capabilities:

GET /api/v1/diary

POST /api/v1/diary

DELETE /api/v1/diary/:entryId

All operations must be scoped to the authenticated user.

## 8. Providers

Proposed capabilities:

GET /api/v1/providers

GET /api/v1/providers/:providerId

GET /api/v1/providers/:providerId/menu

Provider management:

POST /api/v1/provider/menu-items

PATCH /api/v1/provider/menu-items/:itemId

DELETE /api/v1/provider/menu-items/:itemId

The backend must verify provider ownership.

## 9. QR and Referrals

A public provider menu URL should support a referral or campaign identifier.

Example concept:

/providers/:providerId/menu?ref=:campaignId

The actual route and attribution implementation must follow existing frontend and backend conventions.

## 10. Institution Review

Proposed capabilities:

GET /api/v1/institution/submissions

GET /api/v1/institution/submissions/:submissionId

PATCH /api/v1/institution/submissions/:submissionId/review

Only authorized reviewers may use these operations.

## 11. Administration

Proposed capabilities:

GET /api/v1/admin/overview

GET /api/v1/admin/providers

GET /api/v1/admin/foods

PATCH /api/v1/admin/providers/:providerId/status

PATCH /api/v1/admin/foods/:foodId/status

Only authorized administrators may use these operations.

## 12. Implementation Rules

Before using any proposed route:

1. Inspect existing backend routes.
2. Inspect controllers and services.
3. Confirm the actual request and response shape.
4. Reuse an existing route if available.
5. Implement missing functionality in the correct layer.
6. Update this document if the actual contract changes.

The frontend must not invent endpoints or silently assume successful responses.
