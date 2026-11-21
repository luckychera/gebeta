# Gebeta NutriGuider — Mobile UI/UX Spec

Status: Implemented in `apps/mobile`
Product title: **Gebeta NutriGuider**
Brand line: **Know Your Food. Nourish Your Life.**

This spec is the visual source of truth for the React Native demo. The darker glass direction in `docs/UI_UX_DESIGN_SYSTEM.md` remains the note for a future web dashboard. It is not the mobile client.

## 1. Intent

A premium, calm food-health product with a clear Ethiopian point of view.

The mobile UI takes its structure from the reference studies: a soft ivory canvas, white rounded cards, a calorie ring, category chips, a photo-led welcome, and a bottom bar whose scan action sits forward. Color, food, and copy are Gebeta's.

It should not feel like a generic chatbot, a bare calorie counter, a copied gym app, or an admin console.

## 2. Color

| Token | Hex | Use |
|---|---|---|
| Primary | `#176B45` | Progress, confirm, save, links |
| Primary dark | `#0F4A30` | Pressed green |
| Secondary | `#58A66A` | Secondary health marks |
| Accent | `#E58B50` | Food actions, especially Scan |
| Accent soft | `#FDE8DA` | Food-tinted chips |
| Primary soft | `#E5F3EB` | Health-tinted chips |
| Background | `#FAF9F5` | App canvas |
| Surface | `#FFFFFF` | Cards |
| Text | `#202B25` | Primary text |
| Text secondary | `#778078` | Support text |
| Border | `#E9EDE7` | Hairlines |
| Danger | `#C4524A` | Delete |

White text sits on primary and accent buttons. Forest green is dark enough for that contrast.

Green means move forward or show a health figure. Terracotta means a food action.

## 3. Type, space, radius, shadow

- Display: Fraunces, with the system serif as fallback.
- UI: Manrope, with the system sans as fallback.
- Display 34/700, title 28/700, section 20/700, card 16/600, body 15/400, label 12/500.
- Spacing steps: 4, 8, 12, 16, 20, 24, 32.
- Radii: 12 inputs, 16 cards, 22 feature cards, 28 hero, 999 pills.
- Shadow: soft, low, `#203028` at about 8% opacity. No heavy drop shadows.
- Touch targets are at least 44 points.
- On a wide browser the app column is capped at 480 points so the demo reads as a phone.

## 4. Components

Implemented in `apps/mobile/src/components`:

- Wordmark and logo mark
- Primary, secondary, and text buttons
- Cards, badges, chips
- Text fields
- Food cards and meal rows
- Calorie ring and macro bars
- Disclaimer and empty states
- Screen scaffold with loading, and the raised scan tab

## 5. Screens

1. Welcome — wordmark, platter photo, brand line, Get Started, Explore Foods, Sign In.
2. Home — time-of-day greeting, avatar, notices, scan hero, quick actions, featured dishes, recommendations, nutrition overview.
3. Scan — camera, library, sample dishes, preview, retake, analyze.
4. Result — photo, demo suggestion, other matches, confirm, correct.
5. Nutrition — illustrative calories and macros, portion stepper, source, disclaimer, save.
6. Explore — search, filters, dish list, dish detail.
7. Diary — saved meals, dates, delete, empty state.
8. Profile — optional consented details and goals.
9. Businesses — four actors, model, fictional provider menus, QR concept, review and moderation samples.

## 6. Content rules

- Recognition without a configured model is labelled **Demo recognition**.
- Nutrition figures are **illustrative estimates**, with serving basis and source.
- Unknown nutrients stay “Not estimated”. They are not shown as zero.
- Portion changes scale the illustrative per-serving figures linearly and say so.
- Sample day figures are badged **Sample data** and are not written into the diary.
- Provider names are fictional. Menu prices are sample prices, not revenue.
- The product does not diagnose, prescribe, or claim an image can prove ingredients, allergens, oil, recipe ratios, or portion weight.
- Dish photos in `apps/mobile/assets/foods` are illustrative demo art for the interface, not documentary photographs from a kitchen.

## 7. Motion

Short opacity and press feedback only. Analysis waits briefly so the step is visible, with copy that says the demo catalogue is being matched. No fake “AI thinking” claim.
