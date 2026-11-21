# Gebeta — Hackathon MVP Scope

## 1. Objective

Demonstrate a working AI-powered food intelligence platform connecting hotels and their guests.

This is a functional, integrated MVP, not a static frontend prototype.

## 2. Actors

### Hotel administrators and staff
- Manage hotel profiles.
- Create and update menus.
- Manage meals and ingredients.
- Upload food images.
- Provide available nutrition information.

### Guests
- Register and log in.
- Discover hotels.
- Browse digital menus.
- View meal details.
- Set dietary preferences and nutrition goals.
- Receive personalized meal recommendations.

### Platform administrators
- View participating hotels.
- Access basic platform statistics.
- Manage hotel participation.

AI is a platform capability, not a human actor.

## 3. Essential Integrations

- React frontend.
- Node.js and Express backend.
- Supabase Auth.
- Supabase PostgreSQL.
- Supabase Storage.
- Real REST API communication.
- Backend AI provider adapter.

## 4. Demonstration Workflow

1. Hotel administrator signs up.
2. Hotel administrator creates or manages a hotel.
3. Hotel administrator creates a menu.
4. Hotel administrator adds meals, ingredients, images, and available nutrition information.
5. Guest signs up.
6. Guest discovers a hotel and browses its menu.
7. Guest views meal information.
8. Guest saves dietary preferences and nutrition goals.
9. Guest receives meal recommendations with explanations.
10. Platform administrator views hotel participation.

## 5. Demo Simplifications

- Use fictional hotel and guest seed records.
- Use a limited number of sample hotels and meals.
- Keep the administration interface simple.
- Implement only essential workflows.
- Use a configurable AI provider adapter and clearly identified fallback.
- Postpone advanced analytics, subscriptions, complex billing, and native mobile applications.

## 6. Explicitly Not Allowed

The following are NOT acceptable substitutes for the required functionality:

- Frontend-only hardcoded business data.
- Simulated authentication.
- Mock database services.
- Fake API calls.
- Fake AI results presented as genuine AI output.
- UI-only menu management.

Core business data must persist in Supabase.

## 7. Deployment

- Frontend staging: existing Vercel staging project.
- Frontend production: existing Vercel production project.
- Backend hosting: postponed until the backend is implemented and tested.
- Supabase staging and production configuration: to be established.

## 8. Acceptance

The complete hotel-to-guest workflow must work across the frontend, backend, authentication, and database.
