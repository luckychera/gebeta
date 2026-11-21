# Gebeta — UI/UX Design System
## Black Glassmorphism · Premium Dark Interface

## 1. Design Vision

Gebeta should feel like a premium, modern AI-powered food intelligence platform.

The visual identity is based on:

- Black Glassmorphism.
- Deep dark backgrounds.
- Translucent glass surfaces.
- Subtle borders and layered shadows.
- Smooth transitions and micro-interactions.
- Modern typography.
- Rich food photography.
- Interactive dashboards and meaningful statistics.
- Clean layouts with generous spacing.

The interface should communicate intelligence, trust, sophistication, and accessibility.

The design must look like a carefully designed modern SaaS product, not a generic admin dashboard.

IMPORTANT:
This document defines the visual direction. It does not override the architecture, functionality, or security requirements in the root AGENTS.md.

## 2. Core Design Principles

### 2.1 Premium, not complicated
Use sophisticated visual details without overcrowding the interface.

### 2.2 Dark-first experience
The primary application theme is dark.

### 2.3 Glassmorphism with restraint
Use translucent surfaces, background blur, subtle borders, and layered depth.

Do not apply glass effects to every element. Important content must remain readable.

### 2.4 Data should be visually understandable
Statistics, nutrition information, and charts should be easy to interpret.

### 2.5 Functionality before decoration
Animations and visual effects must never interfere with navigation, forms, accessibility, or application performance.

### 2.6 Consistency
All pages must use the same design tokens, spacing system, typography, component styles, and interaction patterns.

## 3. Color System

Use the following initial design tokens.

### Background colors

| Token | Hex | Usage |
|---|---|---|
| background | #08090B | Main application background |
| background-secondary | #0D1013 | Secondary page surfaces |
| background-tertiary | #12171B | Elevated sections |
| surface | #151A1F | Standard cards |
| surface-elevated | #1B2228 | Elevated cards and panels |

### Glass surfaces

| Token | Value | Usage |
|---|---|---|
| glass | rgba(255,255,255,0.045) | Standard glass surface |
| glass-hover | rgba(255,255,255,0.075) | Hover surface |
| glass-strong | rgba(255,255,255,0.09) | Stronger glass panel |
| glass-border | rgba(255,255,255,0.10) | Glass borders |
| glass-border-hover | rgba(255,255,255,0.18) | Interactive borders |

### Brand accent

Use a fresh, food-inspired lime/emerald accent.

| Token | Hex | Usage |
|---|---|---|
| primary | #B7F36B | Primary brand accent |
| primary-hover | #C8FF85 | Hover state |
| primary-muted | #789F45 | Secondary accent |
| primary-glow | rgba(183,243,107,0.18) | Subtle glow |

### Supporting colors

| Token | Hex | Usage |
|---|---|---|
| success | #4ADE80 | Successful operations |
| warning | #FBBF24 | Warnings |
| danger | #F87171 | Errors and destructive actions |
| info | #60A5FA | Informational elements |
| purple | #A78BFA | AI-related visual accents |

### Text colors

| Token | Hex | Usage |
|---|---|---|
| text-primary | #F5F7F2 | Main text |
| text-secondary | #A3ADA5 | Supporting text |
| text-muted | #6F7A73 | Less important information |
| text-inverse | #10140E | Text on bright accent buttons |

Do not use pure white for every text element.

Maintain sufficient contrast between text, glass surfaces, and backgrounds.

## 4. Typography

Use a modern sans-serif typeface.

Preferred:
- Inter
- Geist
- Another clean, readable sans-serif already available in the project.

Typography hierarchy:

- Page heading: 28–36px, semibold or bold.
- Section heading: 20–24px, semibold.
- Card heading: 15–18px, medium or semibold.
- Body: 14–16px, regular.
- Supporting labels: 12–13px.
- Large dashboard statistics: 28–40px, semibold or bold.

Use consistent line heights and avoid excessively small text.

Numbers in dashboards should use tabular numerals where possible.

## 5. Glassmorphism Design Language

Glass components should use:

- Semi-transparent dark backgrounds.
- Backdrop blur.
- Thin, low-opacity borders.
- Soft shadows.
- Subtle highlights.
- Rounded corners.

Example Tailwind-style surface:

```tsx
<div className="
  rounded-2xl
  border border-white/10
  bg-white/[0.045]
  backdrop-blur-xl
  shadow-[0_8px_32px_rgba(0,0,0,0.28)]
">
  {/* Content */}
</div>
```

Interactive glass card:

```tsx
<div className="
  rounded-2xl
  border border-white/10
  bg-white/[0.045]
  backdrop-blur-xl
  transition-all duration-300 ease-out
  hover:-translate-y-1
  hover:border-white/20
  hover:bg-white/[0.075]
">
  {/* Content */}
</div>
```

Avoid:
- Excessive blur.
- Bright borders everywhere.
- Heavy shadows on every component.
- Glass surfaces that reduce text readability.
- Too many overlapping gradients.

Use glass effects primarily for navigation, cards, floating panels, and selected dashboard surfaces.

## 6. Backgrounds and Visual Atmosphere

The background should feel deep and dimensional.

Use:
- Very dark base backgrounds.
- Subtle radial gradients.
- Low-opacity brand-colored ambient lighting.
- Soft background illumination behind important sections.

Example:

```tsx
<div className="
  min-h-screen
  bg-[#08090B]
  text-[#F5F7F2]
">
  <div className="
    pointer-events-none
    fixed inset-0
    bg-[radial-gradient(ellipse_at_top_left,rgba(183,243,107,0.07),transparent_45%)]
  " />
  {/* Application */}
</div>
```

Keep ambient effects subtle.

Do not use gradients as a substitute for a coherent layout.

## 7. Layout and Navigation

### General application layout

Use a consistent application shell.

Desktop:
- Persistent left sidebar for authenticated dashboards.
- Main content area.
- Optional right-side contextual panel when useful.
- Top navigation for page title, notifications, and profile actions.

Mobile:
- Compact top navigation.
- Collapsible navigation or mobile navigation drawer.
- Full-width content.
- Responsive cards and charts.
- Touch-friendly controls.

### Sidebar

The sidebar should:
- Use a dark glass surface.
- Have a clear active navigation indicator.
- Include icons and readable labels.
- Support collapsed and expanded states where useful.
- Remain visually consistent across dashboards.

Do not make the sidebar unnecessarily wide.

### Page structure

Each dashboard page should generally include:

1. Page title and short description.
2. Primary actions.
3. Important statistics where relevant.
4. Main content.
5. Supporting information or recent activity.

Do not force statistics onto pages where they do not provide value.

## 8. Dashboard Statistics and Charts

Dashboards are an important part of Gebeta.

Create visually polished statistics cards.

Each card may contain:
- Metric title.
- Main value.
- Supporting description.
- Trend indicator when real comparison data exists.
- Small icon or visual indicator.
- Optional sparkline when actual historical data exists.

Example Tailwind-style card:

```tsx
<div className="
  rounded-2xl
  border border-white/10
  bg-white/[0.045]
  p-5
  backdrop-blur-xl
">
  <p className="text-sm text-[#A3ADA5]">
    Total Meals
  </p>

  <p className="
    mt-3 text-3xl font-semibold
    tracking-tight text-[#F5F7F2]
  ">
    248
  </p>

  <p className="mt-2 text-xs text-[#4ADE80]">
    Updated this month
  </p>
</div>
```

Charts:
- Use a consistent dark chart theme.
- Use clear labels and tooltips.
- Use the brand accent for primary data.
- Use supporting colors sparingly.
- Avoid unnecessary 3D effects.
- Ensure chart legends and labels remain readable.
- Provide responsive chart containers.

IMPORTANT:
Never fabricate statistics or growth percentages.
Dashboard metrics must come from actual application data.
Clearly label sample seed data during the demonstration.

## 9. Food and Nutrition Visual Design

Food is central to Gebeta.

Use high-quality food photography where available.

Meal cards should display:
- Food image.
- Meal name.
- Hotel or provider name when relevant.
- Price when available.
- Relevant nutrition highlights.
- Dietary tags.
- Availability.
- Clear action to view details.

Nutrition information should be easy to scan.

Use compact information groups for:
- Calories.
- Protein.
- Carbohydrates.
- Fat.
- Portion size.

Only display values that actually exist in the database.

Clearly distinguish estimated nutritional information from provider-supplied information.

Use restrained color indicators for dietary tags, such as:
- Vegetarian.
- Vegan.
- Gluten-free.
- High-protein.
- Low-carb.

Do not imply that a dietary tag or nutrition value has been verified unless it has.

## 10. AI Recommendation Interface

AI-related interfaces should feel intelligent but trustworthy.

Use:
- Subtle purple or brand-accent highlights.
- Clearly structured recommendation cards.
- Concise recommendation explanations.
- Relevant nutrition highlights.
- Clear indication of missing or estimated information.

Avoid:
- Excessive glowing effects.
- Fake AI activity indicators.
- Claims that AI has verified medical suitability.
- Presenting estimated nutritional values as facts.

Recommendation cards should explain why a meal matches the guest's preferences and goals.

## 11. Buttons and Controls

### Primary buttons
- Brand accent background.
- Dark readable text.
- Medium rounded corners.
- Clear hover and focus states.

### Secondary buttons
- Dark translucent background.
- Subtle border.
- Light text.

### Destructive buttons
- Restrained red styling.
- Confirmation for important destructive actions.

### Inputs
- Dark background.
- Subtle border.
- Readable placeholder.
- Clear focus ring.
- Visible validation errors.
- Consistent heights and spacing.

All interactive elements must have clear hover, focus, active, disabled, and loading states where applicable.

## 12. Motion and Transitions

The application should feel smooth and responsive.

Use subtle transitions for:
- Navigation changes.
- Card hover.
- Buttons.
- Dropdown menus.
- Modal dialogs.
- Sidebar interactions.
- Tabs.
- Loading indicators.
- Page content appearance.

Preferred motion:
- 150–200ms for small controls.
- 200–300ms for cards and menus.
- 300–400ms for larger panels and dialogs.

Example:

```tsx
className="
  transition-all duration-200 ease-out
  hover:scale-[1.01]
  active:scale-[0.99]
"
```

Use Framer Motion only if already installed or justified by the implementation.

Do not introduce an animation dependency just for minor hover effects.

Avoid:
- Excessive bouncing.
- Constant animated backgrounds.
- Large movements.
- Unnecessary entrance animations on every component.
- Animations that delay important actions.

Respect `prefers-reduced-motion`.

## 13. Tables, Lists, and Data Management

Hotel dashboards may contain menu and meal management tables.

Tables should:
- Have readable headers.
- Use subtle row separators.
- Support responsive overflow or mobile alternatives.
- Provide clear action controls.
- Highlight hover states subtly.
- Avoid excessive borders.

Use badges for statuses and categories where useful.

Do not overcrowd tables with unnecessary information.

## 14. Forms and Dialogs

Forms should:
- Use clear labels.
- Group related fields.
- Explain required fields.
- Validate input.
- Display helpful error messages.
- Show submission progress.
- Confirm successful operations.

Dialogs should:
- Use dark glass surfaces.
- Have clear headings.
- Support keyboard interaction.
- Close predictably.
- Avoid unnecessarily large dimensions.

For lengthy forms, use sections rather than one overwhelming panel.

## 15. Responsive Design

Design mobile-first, then enhance for larger screens.

Suggested Tailwind breakpoints:
- Default: mobile.
- sm: 640px.
- md: 768px.
- lg: 1024px.
- xl: 1280px.
- 2xl: 1536px.

Requirements:
- No horizontal page overflow.
- Responsive dashboard grids.
- Readable typography at every size.
- Mobile-friendly navigation.
- Touch targets around 44px where practical.
- Responsive images and charts.
- Properly stacked forms and cards.

Do not simply shrink desktop layouts to fit mobile.

## 16. Tailwind CSS Conventions

Use Tailwind CSS as the preferred styling approach if it is already configured or can be integrated cleanly.

Before adding Tailwind:
1. Inspect package.json and existing CSS configuration.
2. Identify the installed Tailwind version.
3. Follow the configuration conventions for that version.
4. Do not mix incompatible Tailwind configuration approaches.

Define reusable design tokens using the project's supported theme configuration or CSS variables.

Avoid repeating long, inconsistent color values throughout components.

Prefer reusable UI components for:
- GlassCard.
- StatCard.
- PrimaryButton.
- SecondaryButton.
- Input.
- Badge.
- DashboardLayout.
- Sidebar.
- PageHeader.
- ChartCard.
- MealCard.
- NutritionSummary.

Do not create abstractions for every tiny element.

## 17. Accessibility

- Maintain readable color contrast.
- Use semantic HTML.
- Provide accessible labels.
- Support keyboard navigation.
- Show visible focus states.
- Provide alternative text for meaningful images.
- Do not communicate status using color alone.
- Respect reduced-motion preferences.
- Ensure dialogs and menus are keyboard accessible.

Glassmorphism must never compromise accessibility.

## 18. Performance

- Avoid unnecessary blur on large screen areas.
- Avoid excessive shadows and animated gradients.
- Optimize images.
- Lazy-load images where appropriate.
- Avoid unnecessary component re-renders.
- Keep animations lightweight.
- Use skeletons or loading states when data is being fetched.

Prioritize smooth interaction on ordinary laptops and mobile devices.

## 19. Design Consistency

Before creating a new component, inspect existing components.

Reuse existing components where appropriate.

Do not create multiple competing versions of the same button, card, input, or navigation element.

Every dashboard and user experience must follow this design system.

## 20. Final Visual Quality Checklist

Before considering frontend work complete, verify:

- The application consistently follows the black glassmorphism identity.
- Backgrounds, surfaces, typography, and spacing are consistent.
- Dashboards contain useful and accurate statistics.
- Food photography is presented cleanly.
- Nutrition information is readable.
- AI recommendations are visually distinct but trustworthy.
- Navigation is clear.
- Buttons and forms have complete interaction states.
- Transitions are smooth but restrained.
- Mobile layouts work properly.
- Accessibility is maintained.
- No page looks like an unrelated template.

The final product should feel like a premium AI food intelligence SaaS platform.

**Design principle: Dark, elegant, intelligent, smooth, and trustworthy.**
