---
id: ITX-004
title: Product Details Page (PDP) and Cart Mutation
status: enriched
discovery: product-catalog
change: ~
priority: must
estimate: 3 SP
language: en
---

# ITX-004 — Product Details Page (PDP) and Cart Mutation

## Goal

Provide the Product Details Page (PDP) at `/product/:id` featuring a responsive two-column layout (device image, technical specifications list, and Storage/Color selectors with default pre-selection) and an "Add" action that submits the configured device to the cart API (`POST /api/cart`) and synchronizes the global cart count.

## Context

- Second of the two required views in the application.
- Fetches device details via cached API service (`ITX-002`) and updates global cart state in the application layout (`ITX-001`).
- Visual layout must strictly adhere to the structure in `workflow/backlog/raw/PDP.png`.
- **Documentation impacts:** Updates `docs/flows/` (product configuration, cart mutation, and header synchronization flow).

## Acceptance criteria

```gherkin
Scenario: Two-column layout with technical specifications
  Given the user navigates to "/product/ZmGrkLRPXOTpxsU4jjAcv"
  When the device details load
  Then the page renders in two columns on desktop viewports
  And Column 1 displays the device image component
  And Column 2 displays the device description and technical attributes: Brand, Model, Price, CPU, RAM, Operating System, Screen resolution, Battery, Cameras, Dimensions, and Weight
  And a navigation link is provided to return to the Product List Page

Scenario: Storage and Color selectors pre-selected by default
  Given device "ZmGrkLRPXOTpxsU4jjAcv" has 1 color option ("Black") and 2 storage options ("16 GB", "32 GB")
  When the Product Details Page renders
  Then both the Color selector and Storage selector are visibly rendered
  And the single Color option ("Black") is selected by default
  And the first Storage option ("16 GB") is selected by default

Scenario: User changes selector choices
  Given the user is on the Product Details Page with storage options "16 GB" (code 2000) and "32 GB" (code 2001)
  When the user selects the "32 GB" storage option
  Then the selector reflects "32 GB" as the active selection
  And subsequent cart submissions submit storageCode 2001

Scenario: Adding configured device to shopping cart
  Given the user has selected Color code 1000 and Storage code 2000 for device "ZmGrkLRPXOTpxsU4jjAcv"
  And the current header cart count is 0
  When the user clicks the "Add" button
  Then a POST request is sent to "https://itx-frontend-test.onrender.com/api/cart" with body {"id": "ZmGrkLRPXOTpxsU4jjAcv", "colorCode": 1000, "storageCode": 2000}
  And upon successful response, the global cart counter updates to 1
  And the updated count of 1 is persisted across page reloads

Scenario: Add button is disabled during submission
  Given the user clicks the "Add" button
  When the cart mutation request is in flight
  Then the "Add" button enters a disabled loading state
  And duplicate clicks are ignored until the request completes

Scenario: Unhappy path - Cart addition API mutation fails
  Given the user clicks the "Add" button
  When the POST request to "/api/cart" fails due to a network outage or server error
  Then a clear error notification is displayed to the user
  And the global cart count remains unchanged
  And the "Add" button is re-enabled to allow another attempt

Scenario: Loading state while fetching device details
  Given the product details are being requested from the API
  When the Product Details Page mounts
  Then a loading placeholder skeleton is displayed until data arrives

Scenario: Unhappy path - Device ID not found
  Given the user navigates to "/product/invalid-id-999"
  When the API responds with an HTTP 404 or empty response
  Then a friendly error message is displayed (e.g., "Device not found")
  And a button or link is available to return to the Product List Page ("/")

Scenario: Graceful rendering when attributes are null or missing
  Given a device detail object has null or empty values for secondary camera or weight
  When the specifications table renders
  Then the missing attribute row displays an informative dash ("-") without breaking the layout
```

## Notes & edge cases

- **Visual Alignment with `PDP.png`**: Breadcrumbs at top left; Column 1 features centered device image; Column 2 features Brand, Model, Price, specs table, Storage selector, Color selector, and "Add" button CTA.
- **Specification Constraint on Selectors**: Even if there is only 1 option available, the selector MUST be displayed and selected by default.
- **API Field Name Mapping**:
  - `secondaryCmera` in API maps to "Secondary Camera" in UI.
  - `dimentions` in API maps to "Dimensions" in UI.
  - `displayResolution` in API maps to "Screen resolution" in UI.
- **Responsive Layout**:
  - Desktop (> 768px): 2 columns (`display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;`).
  - Mobile (<= 768px): 1 column stacked vertically (Image on top, specs and actions below).
- **Accessibility**: Selectors must be operable via keyboard (`<select>` or accessible radio button group with `aria-checked`).

## Estimate

**3 Story Points**

*Rationale*: Covers the 2-column responsive layout matching `PDP.png`, attribute table with null-safe mapping, Storage/Color selector components with mandatory default selection, async Add-to-cart mutation with in-flight disable state, error alerts, loading skeletons, and Vitest/RTL unit tests.

## Definition of Done

- [ ] Acceptance criteria covered by tests
- [ ] Spec deltas archived in openspec/specs/
- [ ] Work merged into the integration branch
