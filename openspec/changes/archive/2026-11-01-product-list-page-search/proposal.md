# Proposal — Product List Page (PLP) Grid and Real-Time Search Filtering

## Why

The Product List Page (PLP) is the main storefront landing view (`/`) of the application. The specification requires presenting the mobile device catalog in a responsive grid layout displaying a maximum of 4 items per row, while providing an instant search bar that filters devices in real time by comparing the user's query against device `brand` and `model`.

Without this capability:
1. Users have no interface to browse the device catalog or discover mobile phones.
2. Users cannot search, filter, or locate specific models or brands.
3. Users cannot select devices to navigate to the Product Details Page (PDP).

Originating Backlog Item: [workflow/backlog/items/ITX-003-product-list-page-search.md](../../../workflow/backlog/items/ITX-003-product-list-page-search.md)

## What Changes

- Replace the placeholder `ProductList` page (`src/pages/ProductList/ProductList.jsx`) with a fully functional catalog view integrating with `productService.getProducts()`.
- Implement `SearchBar` (`src/components/catalog/SearchBar/SearchBar.jsx`) aligned top-right above the catalog grid matching `workflow/backlog/raw/PLP.png`, providing real-time, case-insensitive filtering by `brand` and `model` with whitespace trimming and clear input capability.
- Implement `ProductGrid` (`src/components/catalog/ProductGrid/ProductGrid.jsx`) enforcing responsive column distribution: at most 4 items per row on desktop (> 1024px), 3 on tablet, 2 on small tablet, and 1 on mobile.
- Implement `ProductCard` (`src/components/catalog/ProductCard/ProductCard.jsx`) rendering device Image, Brand, Model, and Price, accessible links to `/product/:id`, and graceful fallback on broken image URLs.
- Implement empty state messaging when search yields zero matches, with a one-click action to clear the search filter.
- Implement skeleton card placeholders during initial fetch, and an error banner with a "Retry" button on network failure.
- Document catalog browsing and search flows in `docs/flows/catalog-browsing.md` and update `docs/topology.md`.

### Non-Goals (Out of Scope)
- Product Details Page (PDP) layout, specifications list, option selectors (storage/color), and "Add to cart" CTA UI (addressed in `ITX-004`).
- Server-side search or pagination (spec specifies client-side filtering over the complete catalog).

## Capabilities

### New Capabilities
- `product-catalog`: Product catalog presentation, responsive 4-column grid layout, card navigation links, real-time search filtering by brand/model, empty state, and loading/error states.

### Modified Capabilities
*(None. `app-shell` routing and header persist intact; `api-cache` provides cached data access)*

## Impact

- **Pages**: `src/pages/ProductList/ProductList.jsx` and `ProductList.module.css`.
- **Components**: `src/components/catalog/SearchBar/`, `src/components/catalog/ProductGrid/`, `src/components/catalog/ProductCard/`.
- **Data Integration**: Consumes `productService.getProducts()` from `src/services/productService.js`.
- **Documentation**: New `docs/flows/catalog-browsing.md` and updated `docs/topology.md`.
- **Testing**: Unit tests for search filtering, grid rendering, image fallback, loading skeletons, and integration tests for route transitions.
