# Design — Product Details Page (PDP) and Cart Mutation

## Context

The application shell (`ITX-001`) provides client-side routing, an accessible sticky header with brand navigation and cart counter badge, and `CartContext` (`useCart`). The API caching service (`ITX-002`) provides `productService.getProductById(id)` with 1-hour TTL caching, and `cartService.addDeviceToCart` for remote `POST /api/cart` mutations.

This design specifies the implementation of the Product Details Page (PDP) at `/product/:id`, featuring a responsive two-column layout (`IMAGE`, `DESCRIPTION`, `ACTIONS`) matching `workflow/backlog/raw/PDP.png`, attribute mapping with null-safety, Storage and Color variant selectors with mandatory default pre-selection, and asynchronous cart mutation handling.

See [proposal.md](./proposal.md) for business motivation and scope boundaries.

## Goals / Non-Goals

**Goals:**
- Provide a responsive two-column layout on desktop (> 768px) and single stacked column on mobile (<= 768px).
- Column 1 (`IMAGE`): Render the primary device image with an aspect-ratio container, light neutral background, and accessible SVG placeholder on load error.
- Column 2 (`DESCRIPTION` & `ACTIONS`):
  - Display Brand, Model, and formatted Price (`formatPrice`).
  - Render a structured specifications table displaying CPU, RAM, Operating System, Screen resolution, Battery, Cameras (primary and secondary), Dimensions, and Weight, with null-safe fallback (`-`).
  - Render Storage and Color selectors that are visibly displayed and pre-selected by default even if only 1 option is available.
  - Render an "Add" button that triggers `POST /api/cart` via `useCart().addToCart({ id, colorCode, storageCode })`.
  - Disable the Add button while the mutation request is in-flight to prevent duplicate requests.
  - Display an alert notification if the cart addition fails, allowing the user to retry.
- Provide two-column skeleton loading placeholders while fetching device details.
- Provide a friendly 404 / error recovery state when a device ID is invalid, with an action to return to the catalog (`/`).

**Non-Goals:**
- Checkout, shipping address collection, or order payment flows.
- Quantity counter or batch device additions (the specification defines single device addition per action).
- Cart drawer or cart management modal.

## Decisions

### 1. Component Architecture & Directory Structure

We decompose the PDP capability into focused, single-responsibility components under `src/components/details/`:

```
src/
├── components/
│   └── details/
│       ├── ProductImage/
│       │   ├── ProductImage.jsx
│       │   ├── ProductImage.module.css
│       │   └── ProductImage.test.jsx
│       ├── ProductDescription/
│       │   ├── ProductDescription.jsx
│       │   ├── ProductDescription.module.css
│       │   └── ProductDescription.test.jsx
│       ├── ProductActions/
│       │   ├── ProductActions.jsx
│       │   ├── ProductActions.module.css
│       │   └── ProductActions.test.jsx
│       └── ProductDetailsSkeleton/
│           ├── ProductDetailsSkeleton.jsx
│           ├── ProductDetailsSkeleton.module.css
│           └── ProductDetailsSkeleton.test.jsx
└── pages/
    └── ProductDetails/
        ├── ProductDetails.jsx
        ├── ProductDetails.module.css
        └── ProductDetails.test.jsx
```

- **`ProductDetails` (Page Container)**: Manages device detail lifecycle (`product`, `loading`, `error`), extracts `id` from `useParams()`, and coordinates error/not-found recovery.
- **`ProductImage` (Column 1)**: Renders the device image with an aspect-ratio container, zoom hover effect, and SVG placeholder on error.
- **`ProductDescription` (Column 2 Top)**: Formats and displays technical specifications with clean labels and null-safe value resolution.
- **`ProductActions` (Column 2 Bottom)**: Manages local selector state (`selectedColor`, `selectedStorage`), enforces default pre-selections, and dispatches cart additions via `useCart().addToCart`.
- **`ProductDetailsSkeleton`**: Replicates the two-column PDP layout with animated CSS shimmer pulses to prevent Cumulative Layout Shift (CLS).

### 2. Option Selector Design & Default Pre-Selection

The technical specification mandates:
> *Even if there is only 1 option available, the selector must be displayed and selected by default.*

- **Data Model**:
  - `options.colors`: `Array<{ code: number, name: string }>`
  - `options.storages`: `Array<{ code: number, name: string }>`
- **State Initialization**:
  - When `product` loads or changes, `ProductActions` initializes:
    - `selectedColor`: `product.options?.colors?.[0]?.code ?? null`
    - `selectedStorage`: `product.options?.storages?.[0]?.code ?? null`
- **UI Presentation**:
  - Rendered as accessible option pill groups (`role="radiogroup"` with `role="radio"` and `aria-checked`).
  - Active option highlighted with accent border and background.
  - Keyboard operable with Tab, Space, and Arrow keys.
- **Alternatives considered**:
  - Native `<select>` elements: Functional, but styled button/pill groups offer significantly higher visual aesthetics and immediate touch targets matching modern e-commerce standards and `PDP.png`.

### 3. Attribute Extraction & Null-Safe Formatting

Remote API payloads contain occasional typos and varied formats:
- Typo in API: `dimentions` $\rightarrow$ mapped to "Dimensions" in UI.
- Typo in API: `secondaryCmera` $\rightarrow$ mapped to "Secondary Camera" in UI.
- `displayResolution`: mapped to "Screen resolution".
- Cameras: `primaryCamera` and `secondaryCmera` may be strings or arrays:
  - Formatter helper `formatAttributeValue(val)` checks if `Array.isArray(val) ? val.join(', ') : val`.
  - If null, undefined, or empty string $\rightarrow$ returns `'-'`.

Specifications list displayed:
1. Brand (`brand`)
2. Model (`model`)
3. Price (`formatPrice(price)`)
4. CPU (`cpu`)
5. RAM (`ram`)
6. Operating System (`os`)
7. Screen resolution (`displayResolution`)
8. Battery (`battery`)
9. Primary Camera (`primaryCamera`)
10. Secondary Camera (`secondaryCmera`)
11. Dimensions (`dimentions`)
12. Weight (`weight` in grams)

### 4. Cart Mutation Lifecycle & In-Flight State

- When user clicks "Add" (or "Añadir al carrito"):
  1. `ProductActions` verifies `selectedColor` and `selectedStorage` are selected.
  2. Invokes `addToCart({ id: product.id, colorCode: selectedColor, storageCode: selectedStorage })`.
  3. `isMutating` from `useCart()` turns `true`, rendering the button in a disabled loading state:
     - `disabled={isMutating}`
     - Button text updates to "Adding..." with a loading spinner icon.
  4. On success:
     - Global cart badge in header updates immediately.
     - Optional brief success toast or checkmark confirmation is displayed.
  5. On failure:
     - Caught by `ProductActions`.
     - Displays error message in an accessible `role="alert"` region.
     - Button re-enables for retry.

### 5. Responsive Layout Strategy

Matching `workflow/backlog/raw/PDP.png`:

```css
.container {
  width: 100%;
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--spacing-6) var(--spacing-4);
}

.layoutGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-8);
  align-items: start;
}

@media (max-width: 768px) {
  .layoutGrid {
    grid-template-columns: 1fr;
    gap: var(--spacing-6);
  }
}
```

- Navigation back link positioned at top left: "← Back to products" (navigating to `/`).

## Risks / Trade-offs

- `[Risk] Remote API device record missing options.colors or options.storages` → Mitigation: Defensive fallbacks default to empty arrays `[]`, and the Add button is disabled if no valid variant codes can be selected.
- `[Risk] Slow network during cart mutation leads to multiple duplicate clicks` → Mitigation: `isMutating` state from `CartContext` disables the button immediately on the first click and prevents repeat submissions.
- `[Risk] User navigates directly to a non-existent product ID (/product/unknown-id)` → Mitigation: `productService.getProductById` rejects with 404, caught by `ProductDetails` to render a clean "Product not found" screen with a return link to `/`.
- `[Risk] Camera attributes returned as arrays instead of strings` → Mitigation: `formatAttributeValue` normalizes arrays via `.join(', ')`.

## Migration Plan

1. Create `src/components/details/` components (`ProductImage`, `ProductDescription`, `ProductActions`, `ProductDetailsSkeleton`) with modular CSS and unit tests.
2. Update `src/pages/ProductDetails/ProductDetails.jsx` to replace placeholder markup with the integrated view.
3. Validate visual alignment against `workflow/backlog/raw/PDP.png`.
4. Run full test suite (`npm test`), lint (`npm run lint`), and build check (`npm run build`).

## Open Questions

*(None. All requirements, attribute mappings, selector rules, and API payloads are fully specified).*
