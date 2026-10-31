---
id: ITX-001
title: Application Shell, Client Routing, and Global Header
status: proposed
discovery: product-catalog
change: app-shell-header
priority: must
estimate: 3 SP
language: en
---

# ITX-001 — Application Shell, Client Routing, and Global Header

## Goal

Provide the foundational Single-Page Application (SPA) shell, client-side routing structure, and a global Header component displaying an application title/logo home link, navigation breadcrumbs, and a live cart item counter, so users have consistent navigation and cart visibility across all views.

## Context

- Core architectural baseline for the application built on React 19, React Router v7 (SPA Library Mode), and Vite.
- Defines the shared layout wrapper for the two primary views: Product List Page (`/`) and Product Details Page (`/product/:id`).
- Connects to the cart state provider to display real-time cart item counts.
- **Documentation impacts:** Updates `docs/topology.md` (component layout and routing hierarchy) and `docs/README.md` (project setup, scripts, and dev server execution).

## Acceptance criteria

```gherkin
Scenario: Logo navigation to home view
  Given the user is on any view in the application
  When the user clicks the application logo or title in the Header
  Then the application navigates to the Product List Page ("/") without a full page reload

Scenario: Breadcrumb reflects current navigation state
  Given the user navigates to the Product Details Page for device id "ZmGrkLRPXOTpxsU4jjAcv"
  When the Header breadcrumbs render
  Then the breadcrumbs display a link to "Home" and the current product indicator
  And clicking "Home" in the breadcrumbs navigates back to "/"

Scenario: Header displays persistent cart item count
  Given the user has 3 items in their shopping cart
  When the user visits any page or navigates between views
  Then the Header displays a cart badge showing "3" on the right side

Scenario: Cart badge display when cart is empty
  Given the user has 0 items in their shopping cart
  When the Header renders
  Then the cart counter visibly displays "0"
  And the badge has an accessible description indicating the cart is empty

Scenario: Responsive header layout on mobile viewports
  Given the application is viewed on a mobile viewport (width <= 600px)
  When the Header renders
  Then the logo, breadcrumbs, and cart badge remain visible without overlapping or causing horizontal scroll

Scenario: Unhappy path - Navigating to an unrecognized route
  Given the user navigates to an invalid path "/unknown-route"
  When the router resolves the location
  Then a user-friendly 404 Not Found view is displayed
  And a link is provided to return to the Product List Page ("/")
```

## Notes & edge cases

- **Accessibility**: Header uses `<header>` landmark, breadcrumbs use `<nav aria-label="Breadcrumb">` with ordered list semantics, and cart badge includes descriptive `aria-label` (e.g., "Shopping cart: 3 items").
- **Sticky Header**: Header stays pinned at top of viewport with high z-index and subtle shadow to distinguish from scrollable content.
- **Deep-linking & Fallback**: Client-side routing must support direct deep-link access (e.g. refreshing `/product/:id`) with fallback handling for unresolvable product segments.
- **Styling**: Modern CSS Modules or scoped CSS ensuring zero styling bleed or heavy runtime dependencies.

## Estimate

**3 Story Points**

*Rationale*: Covers initializing the React 19 + Vite boilerplate, configuring React Router v7 in SPA mode, creating the root `Layout`, implementing the sticky `Header` with logo, breadcrumbs, and reactive cart badge, creating the 404 Not Found view, and writing comprehensive Vitest + React Testing Library unit tests.

## Definition of Done

- [ ] Acceptance criteria covered by tests
- [ ] Spec deltas archived in openspec/specs/
- [ ] Work merged into the integration branch
