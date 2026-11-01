# Tasks — Product List Page (PLP) Grid and Real-Time Search Filtering

## 1. SearchBar Component

- [x] 1.1 Implement `SearchBar.jsx` in `src/components/catalog/SearchBar/SearchBar.jsx` with search input, clear button (`×`), search icon, and accessibility attributes (`role="search"`, `aria-label="Search devices by brand or model"`). Verify by verifying component exports and JSX structure.
- [x] 1.2 Implement `SearchBar.module.css` with responsive styling and top-right alignment matching `PLP.png`. Verify styles through CSS class binding.
- [x] 1.3 Implement unit tests in `src/components/catalog/SearchBar/SearchBar.test.jsx` covering input change events, query value binding, clear button clicks, and accessibility labels. Verify with `npx vitest run src/components/catalog/SearchBar/SearchBar.test.jsx`.

## 2. ProductCard and ProductSkeleton Components

- [x] 2.1 Implement `ProductCard.jsx` in `src/components/catalog/ProductCard/ProductCard.jsx` displaying image with fallback error handler, brand, model, price formatting, and link to `/product/:id`. Verify by verifying component exports and props structure.
- [x] 2.2 Implement `ProductSkeleton.jsx` in `src/components/catalog/ProductSkeleton/ProductSkeleton.jsx` and CSS modules (`ProductCard.module.css`, `ProductSkeleton.module.css`) providing card hover elevation, image container aspect ratio, and shimmer animation. Verify styles through CSS class binding.
- [x] 2.3 Implement unit tests in `src/components/catalog/ProductCard/ProductCard.test.jsx` and `ProductSkeleton.test.jsx` covering device attributes rendering, currency formatting (`€`), broken image fallback, and navigation link target. Verify with `npx vitest run src/components/catalog/ProductCard/`.

## 3. ProductGrid Component

- [x] 3.1 Implement `ProductGrid.jsx` in `src/components/catalog/ProductGrid/ProductGrid.jsx` rendering a responsive grid container for child cards and skeletons. Verify by checking component exports.
- [x] 3.2 Implement `ProductGrid.module.css` with CSS Grid rules: max 4 columns on desktop (> 1024px), 3 columns on tablet (768px – 1024px), 2 columns on small tablet (540px – 767px), and 1 column on mobile (< 540px). Verify media query breakpoints and grid rules.
- [x] 3.3 Implement unit tests in `src/components/catalog/ProductGrid/ProductGrid.test.jsx` verifying grid container rendering and child propagation. Verify with `npx vitest run src/components/catalog/ProductGrid/ProductGrid.test.jsx`.

## 4. ProductList Page Integration

- [x] 4.1 Update `src/pages/ProductList/ProductList.jsx` and `ProductList.module.css` integrating `productService.getProducts()`, search query state, `SearchBar`, `ProductGrid`, and responsive layout. Verify by verifying page component rendering.
- [x] 4.2 Implement synchronous in-memory search filtering comparing query strings against `brand` and `model` (case-insensitive, whitespace-trimmed). Verify filtering behavior via unit tests.
- [x] 4.3 Implement empty search state feedback with a clear search CTA button, and error state banner with a "Retry" button. Verify state rendering in unit tests.
- [x] 4.4 Implement comprehensive test suite in `src/pages/ProductList/ProductList.test.jsx` covering initial skeleton loading, cached and remote catalog rendering, real-time search filtering, empty search feedback with reset CTA, API error banner with retry recovery, and card navigation. Verify with `npx vitest run src/pages/ProductList/ProductList.test.jsx`.

## 5. Documentation & Topology Updates

- [x] 5.1 Create `docs/flows/catalog-browsing.md` documenting catalog browsing, search filtering sequence, and error recovery flows. Verify file exists and markdown is valid.
- [x] 5.2 Update `docs/topology.md` to document the new `src/components/catalog/` components and integration with `productService`. Verify documentation accuracy.

## 6. Integration Quality Gate

- [x] 6.1 Run full Vitest test suite across all application components and verify all tests pass with zero failures (`npm test`).
- [x] 6.2 Run ESLint checks and verify zero errors and zero warnings (`npm run lint`).
- [x] 6.3 Run production compilation and verify bundle builds successfully with zero errors (`npm run build`).
