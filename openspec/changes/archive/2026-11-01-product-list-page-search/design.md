# Design — Product List Page (PLP) Grid and Real-Time Search Filtering

## Context

The application shell (`ITX-001`) provides client-side routing with React Router v7 and an accessible header with brand navigation and cart counter. The API cache service (`ITX-002`) provides `productService.getProducts()`, handling 1-hour TTL client-side caching and remote API retrieval.

This design specifies the implementation of the Product List Page (PLP) at `/`, displaying mobile devices in a responsive grid (maximum 4 items per row) and an instant search filter comparing query strings against `brand` and `model` in real time, matching the visual layout in `workflow/backlog/raw/PLP.png`.

See [proposal.md](./proposal.md) for business motivation and scope boundaries.

## Goals / Non-Goals

**Goals:**
- Provide a responsive product catalog grid displaying a maximum of 4 items per row on desktop viewports (> 1024px), adapting down to 3, 2, and 1 column on smaller screens.
- Implement an instant search input positioned top-right above the grid, filtering devices in real time by `brand` and `model` (case-insensitive, whitespace-trimmed).
- Provide visual skeleton placeholders during catalog fetch to prevent layout shifts.
- Provide clear empty state feedback when a search query matches zero devices, with a one-click action to clear the search filter.
- Provide an error state with a "Retry" CTA when catalog fetching fails.
- Provide resilient image rendering with automatic SVG fallback when product images fail to load.
- Ensure WCAG AA accessibility with semantic HTML (`<main>`, `<section>`, `<article>`, `<label>`), keyboard focus indicators, and screen reader announcements.

**Non-Goals:**
- Product Details Page (PDP) layout, specifications list, color/storage selectors, and cart mutations (scoped to `ITX-004`).
- Server-side search, filtering, or pagination (the test specification mandates client-side filtering over the complete catalog).

## Decisions

### 1. Component Architecture & Directory Structure

We decompose the catalog capability into focused, single-responsibility components under `src/components/catalog/`:

```
src/
├── components/
│   └── catalog/
│       ├── SearchBar/
│       │   ├── SearchBar.jsx
│       │   ├── SearchBar.module.css
│       │   └── SearchBar.test.jsx
│       ├── ProductCard/
│       │   ├── ProductCard.jsx
│       │   ├── ProductCard.module.css
│       │   └── ProductCard.test.jsx
│       ├── ProductGrid/
│       │   ├── ProductGrid.jsx
│       │   ├── ProductGrid.module.css
│       │   └── ProductGrid.test.jsx
│       └── ProductSkeleton/
│           ├── ProductSkeleton.jsx
│           ├── ProductSkeleton.module.css
│           └── ProductSkeleton.test.jsx
└── pages/
    └── ProductList/
        ├── ProductList.jsx
        ├── ProductList.module.css
        └── ProductList.test.jsx
```

- **`ProductList` (Page Container)**: Manages catalog fetch lifecycle (`products`, `loading`, `error`), search query state (`searchQuery`), error recovery (`handleRetry`), and empty state coordination.
- **`SearchBar` (Presentation & Input)**: Accessible controlled text input with search icon, clear button (`×`), result count indicator, and `aria-label`.
- **`ProductGrid` (Layout Container)**: Renders CSS grid container receiving child `ProductCard` elements or `ProductSkeleton` elements.
- **`ProductCard` (Presentation Card)**: Renders image with error fallback, brand, model, formatted price, and accessible navigation link to `/product/:id`.
- **`ProductSkeleton` (Loading Placeholder)**: Replicates the dimensions and card shape of `ProductCard` with an animated CSS shimmer pulse.

*Alternatives considered:*
- Monolithic `ProductList.jsx`: Placing all markup and logic in a single file would hurt readability, testability, and separation of concerns.
- Generic UI `Card` component: Premature abstraction; creating a specialized `ProductCard` maintains clean domain boundaries for e-commerce catalog items.

### 2. Search Filtering Strategy: Synchronous In-Memory Matching

The device catalog contains approximately 100 devices. Filtering 100 JavaScript objects by string comparison takes `< 0.2ms` on modern mobile and desktop engines.

We implement real-time filtering directly in `ProductList` using `useMemo`:
```javascript
const filteredProducts = useMemo(() => {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return products;

  return products.filter((item) => {
    const brand = (item.brand || '').toLowerCase();
    const model = (item.model || '').toLowerCase();
    return brand.includes(query) || model.includes(query);
  });
}, [products, searchQuery]);
```

- **Rationale**: Immediate synchronous filtering guarantees 60fps input response with zero typing latency.
- **Alternatives considered**:
  - Debounced input (e.g. 300ms delay): Unnecessary for 100 in-memory items and introduces perceived sluggishness.
  - Web Worker: Extreme over-engineering for a sub-millisecond array filter.

### 3. Responsive CSS Grid Layout (Max 4 Columns)

Matching the screenshot `workflow/backlog/raw/PLP.png`, the product catalog is displayed with at most 4 items per row on desktop screens and adjusts responsively:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-6);
  width: 100%;
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-4);
  }
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 540px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

- **Rationale**: CSS Grid guarantees uniform card heights, aligned rows, and responsive reflow without manual margin calculations or horizontal overflow.
- **Alternatives considered**: Flexbox with percentage widths (`calc(25% - gap)`): More verbose and error-prone when managing gap distribution.

### 4. Resilient Image Loading & Fallback

External image URLs provided by the API may occasionally be unreachable or return 404:
- `ProductCard` maintains internal `imageError` state: `<img onError={() => setImageError(true)} ... />`.
- When `imageError` is true or `imgUrl` is missing, an inline SVG placeholder illustrating a mobile phone silhouette is rendered.
- An explicit `aspect-ratio: 1 / 1` (or `4 / 5`) and `object-fit: contain` are specified to prevent Cumulative Layout Shift (CLS) during image loading.

### 5. Price Display & Currency Formatting

- The API returns `price` either as a number or string (e.g., `'170'`). If empty or missing, it should display `'N/A'`.
- Format prices with the Euro symbol (`€`) matching the mock reference in `PLP.png` (e.g. `170 €`).
- Helper formatting function: `formatPrice(price)` returns `${price} €` or `'N/A'`.

### 6. Accessibility & Semantic Markup

- **Page Container**: `<main id="main-content" tabIndex="-1">`.
- **Search Bar**: `<search role="search">` wrapper with `<label htmlFor="catalog-search" className="sr-only">Search devices</label>` and `<input id="catalog-search" aria-label="Search devices by brand or model" type="search" />`.
- **Product Card**: `<article className={styles.card}>` wrapped in an accessible `<Link to={'/product/' + item.id} aria-label={item.brand + ' ' + item.model + ', ' + formattedPrice}>`.
- **Empty State**: An accessible alert region `<div role="status" aria-live="polite">` announcing "No products found matching '{query}'".

## Risks / Trade-offs

- `[Risk] Remote images from the API fail or load slowly` → Mitigation: Card uses fixed aspect-ratio container with neutral background and renders an accessible SVG device placeholder on `onError`.
- `[Risk] API data contains missing or null brand/model/price fields` → Mitigation: Defensive fallbacks `(item.brand || '').toLowerCase()` and `formatPrice(item.price)` ensure search and rendering never throw exceptions.
- `[Risk] Search input re-filtering causing unnecessary re-renders` → Mitigation: Synchronous array filter is memoized with `useMemo([products, searchQuery])`; items maintain stable `key={product.id}`.
- `[Risk] Accessibility outline clipping on cards` → Mitigation: Card links use `outline-offset: 2px` and `border-radius: var(--radius-md)` with visible `:focus-visible` styling.

## Migration Plan

1. Create catalog components (`SearchBar`, `ProductCard`, `ProductGrid`, `ProductSkeleton`) with modular CSS and unit tests.
2. Update `ProductList` page to replace placeholder markup with the integrated search and catalog grid.
3. Validate visual alignment against `workflow/backlog/raw/PLP.png`.
4. Run comprehensive test suite (`npm test`), lint (`npm run lint`), and build check (`npm run build`).

## Open Questions

*(None. All functional requirements, responsive breakpoints, and API integration points are fully defined in ITX-003 and specifications).*
