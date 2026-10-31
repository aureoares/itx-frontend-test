---
id: ITX-003
title: Product List Page (PLP) Grid and Real-Time Search Filtering
status: enriched
discovery: product-catalog
change: ~
priority: must
estimate: 3 SP
language: en
---

# ITX-003 — Product List Page (PLP) Grid and Real-Time Search Filtering

## Goal

Provide the Product List Page (PLP) at `/` that displays mobile devices in a responsive grid (maximum 4 items per row) and provides real-time search filtering by brand and model, enabling users to quickly locate and explore devices.

## Context

- First of the two required views in the application.
- Consumes the product catalog via the cached API service (`ITX-002`) and renders within the application layout (`ITX-001`).
- Visual layout must strictly adhere to the structure in `workflow/backlog/raw/PLP.png`.
- **Documentation impacts:** Updates `docs/flows/` (catalog browsing and real-time search sequence).

## Acceptance criteria

```gherkin
Scenario: Full product catalog displayed in responsive grid
  Given the product catalog API returns 100 devices
  When the user visits the Product List Page ("/")
  Then all devices are rendered in item cards
  And the grid layout displays at most 4 items per row on desktop screens
  And each card displays the product image, brand, model, and formatted price

Scenario: Real-time search filtering by brand or model
  Given the product list contains devices from various brands ("Acer", "Alcatel", "Apple")
  When the user types "apple" into the search bar
  Then the displayed list filters in real time to show only items whose brand or model contains "apple" (case-insensitive)
  And the search input displays the current query text

Scenario: Search filtering handles whitespace and clearing
  Given the user enters search query "  Iconia  " with leading and trailing spaces
  When the real-time filter applies
  Then items matching "Iconia" are displayed
  And when the user clears the search input
  Then the full catalog of 100 items is immediately restored

Scenario: Product selection navigates to Product Details Page
  Given a device card with id "ZmGrkLRPXOTpxsU4jjAcv" is rendered
  When the user clicks on the device card
  Then the application navigates to "/product/ZmGrkLRPXOTpxsU4jjAcv"

Scenario: Unhappy path - Search query yields zero matches
  Given the user is on the Product List Page
  When the user enters a search term "NonExistentModel999" that matches no devices
  Then the item grid is replaced by a clear empty state message (e.g., "No devices match your search")
  And the user is able to clear the search input to restore the full catalog

Scenario: Loading state while fetching product catalog
  Given the product catalog is being fetched from the API and is not yet in cache
  When the Product List Page mounts
  Then a visual loading indicator (e.g., skeleton cards or spinner) is displayed until data arrives

Scenario: Unhappy path - Catalog API failure with retry action
  Given the remote API fails with a network error and no cached catalog exists
  When the Product List Page mounts
  Then an error message is displayed informing the user of the failure
  And a "Retry" button is provided to re-attempt fetching the catalog

Scenario: Image load error displays fallback placeholder
  Given a device item has a broken or unreachable image URL
  When the card renders in the browser
  Then a graceful placeholder image is displayed without breaking the card layout
```

## Notes & edge cases

- **Visual Alignment with `PLP.png`**: Search input positioned on the top right above the grid; item cards include card shadow, hover elevation effect, and clean typography.
- **Responsive Breakpoints**:
  - Desktop (> 1024px): 4 columns (`grid-template-columns: repeat(4, 1fr)`).
  - Tablet (768px – 1024px): 3 columns.
  - Small Tablet (600px – 767px): 2 columns.
  - Mobile (< 600px): 1 column.
- **Search Performance**: Instant client-side filtering over the in-memory array (`< 1ms` execution for 100 items) ensures 60fps typing responsiveness without lag.
- **Accessibility**: Search input includes `aria-label="Search devices by brand or model"`, and device cards use semantic `<article>` tags wrapped in accessible links.

## Estimate

**3 Story Points**

*Rationale*: Covers the responsive CSS Grid layout matching `PLP.png`, the Search component with real-time case-insensitive filtering, empty state feedback, skeleton loading cards, error banner with retry mechanism, image fallback handler, and Vitest/RTL unit tests.

## Definition of Done

- [ ] Acceptance criteria covered by tests
- [ ] Spec deltas archived in openspec/specs/
- [ ] Work merged into the integration branch
