# Gebeta — Hackathon Build Plan

Version: 1.0
Objective: Deliver a coherent, working web demonstration.

## Phase 0 — Repository Audit

Before coding:

- Inspect the complete repository.
- Inspect frontend and backend package files.
- Inspect existing routes and components.
- Inspect Supabase configuration and migrations.
- Inspect the current UI design system.
- Identify incomplete or broken features.
- Report the actual current implementation state.

Deliverable:
A short implementation audit and a prioritized list of missing pieces.

Do not rewrite the project during the audit.

## Phase 1 — Application Foundation

Implement or verify:

- Application entry point.
- Routing.
- Shared layout.
- Responsive navigation.
- Public homepage.
- Reusable UI components.
- Loading and error states.

Acceptance:
The website loads and navigation works on desktop and mobile.

## Phase 2 — Food Catalogue

Implement:

- Food data model.
- Demo food dataset.
- Food listing.
- Search.
- Category filtering.
- Food detail page.
- Nutrition information display.

Acceptance:
A user can discover a food and inspect its available information.

## Phase 3 — Food Scan Journey

Implement:

- Image selection/upload.
- Image validation.
- Recognition adapter.
- Mock recognition fallback.
- Candidate results.
- Candidate confirmation/correction.
- Serving selection.
- Nutrition result.

Acceptance:
A user can complete the scan-to-confirmation-to-nutrition journey.

This is a major demo milestone.

## Phase 4 — Food Diary

Implement:

- Save confirmed meal.
- View diary history.
- Delete diary entry.
- Empty state.

Acceptance:
A user can save and later view a confirmed meal.

## Phase 5 — Provider Menu

Implement:

- Provider dashboard.
- Provider profile.
- Menu listing.
- Add menu item.
- Edit menu item.
- Publish/unpublish.
- Public provider menu.

Acceptance:
A provider can manage a sample menu and a guest can view the published menu.

## Phase 6 — QR and Referral

Implement:

- Provider menu URL.
- QR generation.
- Referral/campaign identifier.
- Basic demo attribution.

Acceptance:
A QR code or referral link opens the correct provider menu.

## Phase 7 — Institution Review

Implement a simplified workflow:

- Review queue.
- Submission detail.
- Source/reference information.
- Reviewer note.
- Approve/reject/request changes.

Acceptance:
A reviewer can change a sample submission's status.

## Phase 8 — Admin Moderation

Implement:

- Dashboard summary.
- Provider status list.
- Food moderation list.
- Basic status actions.
- Activity list.

Acceptance:
An administrator can demonstrate basic platform moderation.

## Phase 9 — Final Demo Preparation

- Test every primary journey.
- Check mobile responsiveness.
- Check navigation.
- Check empty/error states.
- Remove broken links and fake buttons.
- Verify all demo labels.
- Prepare sample accounts or demo role switching.
- Prepare demo data.
- Record the demonstration.

## Priority Rule

If time is limited:

1. Finish Phase 1.
2. Finish Phase 2.
3. Finish Phase 3.
4. Finish Phase 5.
5. Finish Phase 6.
6. Add Phase 4.
7. Add Phase 7 and Phase 8.

Do not sacrifice the two main journeys to build several incomplete dashboards.

## Cursor Execution Rule

Work phase by phase.

Before starting a phase:

- Inspect what already exists.
- Identify what is complete.
- Identify what is missing.
- Reuse working code.

After a phase:

- Run relevant checks.
- Summarize files changed.
- State what is complete and what remains.

Do not proceed by blindly generating the entire application in one operation.
