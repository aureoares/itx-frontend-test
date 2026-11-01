# Application Architecture & Component Topology

This document details the architectural topology, component hierarchy, routing model, and state persistence design for the **ITX Front-End Technical Test** Single-Page Application (SPA).

---

## 1. Architectural Principles

In accordance with [AGENTS.md](../AGENTS.md) and [docs/technical-decisions.md](technical-decisions.md):
1. **Pure SPA Client-Side Architecture**: Implemented with **React 19** and **React Router v7** in SPA Library Mode (`createBrowserRouter` / `RouterProvider`). No Server-Side Rendering (SSR) or Multi-Page Application (MPA) paradigms.
2. **JavaScript ES6+**: Written in standard ES6+ with zero TypeScript, adhering strictly to the client's constraint.
3. **Decoupled State Management**: Application-wide state (such as cart counter and storage synchronization) is encapsulated in React Context with custom hooks and persistent storage.
4. **Accessible Landmarks**: Strict semantic HTML5 structure with `<header role="banner">`, `<nav aria-label="Breadcrumb">`, and `<main id="main-content">`.

---

## 2. Component Hierarchy & Layout Shell

The application is structured into clear architectural layers:

```
[ App Root ]
    │
    ▼
[ CartProvider ] (manages reactive cartCount, persists to localStorage)
    │
    ▼
[ RouterProvider ] (manages client-side navigation via createBrowserRouter)
    │
    ▼
[ Layout ] (wraps all routes)
    ├── <header role="banner"> [ Header ]
    │       ├── <a href="/" aria-label="..."> [ Brand Logo & Title ]
    │       ├── <nav aria-label="Breadcrumb"> [ Breadcrumbs ]
    │       └── <div role="status"> [ CartBadge ]
    │
    └── <main id="main-content"> [ <Outlet /> ]
            │
            ├── Route: "/" ──────────────► [ ProductList (PLP) ]
            │                                  ├── [ SearchBar ]
            │                                  └── [ ProductGrid ] ──► [ ProductCard (Item) ]
            │
            ├── Route: "/product/:id" ───► [ ProductDetails (PDP) ]
            │                                  ├── Column 1: [ ProductImage ]
            │                                  └── Column 2: [ ProductDescription ] & [ ProductActions ]
            │
            └── Route: "*" ──────────────► [ NotFound (404 View) ]
```

---

## 3. Routing Topology

Routes are configured declaratively in `src/router/index.jsx`:

| Path | Component | View Purpose | Breadcrumbs State |
| :--- | :--- | :--- | :--- |
| `/` | `ProductList` | Product List Page (PLP) displaying device catalog and live search | `Home` (hidden or single root element) |
| `/product/:id` | `ProductDetails` | Product Details Page (PDP) displaying device specs, selectors, and CTA | `Home > [Model Name]` (fallback: `Product Details`) |
| `*` | `NotFound` | 404 Catch-All Fallback page for non-existent paths | `Home > [Path Segment]` |

All routes share the persistent `Layout` component containing `Header`, ensuring uninterrupted header and cart counter presence across transitions.

---

## 4. State Management & Persistence Layer

### 4.1 Data Access & Caching Layer (`src/services/`)

The application implements a decoupled 3-tier data access architecture:

```
[ UI Layer: React Components / CartContext ]
               │                │
               ▼                ▼
       [ productService ]  [ cartService ]       (Domain Services)
               │                │
         ┌─────┴──────┐         │
         ▼            ▼         ▼
   [ storageService ]   [ apiClient ]             (Core Infrastructure)
         │                    │
         ▼                    ▼
[ localStorage / Memory ] [ Remote REST API ]
```

- **`apiClient.js`**: Low-level HTTP client wrapping `fetch` with standard timeouts (10s abort signal), JSON parsing, and normalized `ApiError` exceptions.
- **`storageService.js`**: Client persistence layer with key prefixing (`itx_`), timestamped envelopes (`{ timestamp, data }`), automatic recovery from corrupted JSON, and transparent in-memory `Map` fallback when storage quota is exceeded or disabled.
- **`productService.js`**: Domain service managing catalog (`/api/product`) and detail (`/api/product/:id`) retrieval. Enforces exact 1-hour (3,600,000 ms) TTL cache validation with lazy revalidation upon expiration.
- **`cartService.js`**: Domain service managing cart mutations (`POST /api/cart`) and accumulating running item quantities on the client against the stateless mock API.

### 4.2 Cart State & Reactivity (`src/context/CartContext.jsx`)
- **Storage Key**: `itx_cart_count` stored via `storageService`.
- **State Initialization**: Lazy initializer reads and parses `cartService.getStoredCartCount()`, defaulting to `0` on parse failure or missing value.
- **Mutations**:
  - `addToCart(amountOrPayload)`: When passed a device payload (`{ id, colorCode, storageCode }`), executes `cartService.addDeviceToCart`, toggling `isMutating` state, updating total count in storage, and capturing any error in `mutationError`. Also supports numeric increment fallback for direct testing.
  - `setCartCount(count)`: Updates count to an exact non-negative integer via `cartService.setStoredCartCount(count)`.
- **Cross-Tab Synchronization**: Listens for window `'storage'` events on `'itx_cart_count'` to reflect cart updates across multiple active browser tabs in real time.

---

## 5. Design System & Styling Architecture

- **Tokens (`src/styles/variables.css`)**:
  - Color palette: Neutral grays, deep slate text (`#0f172a`), indigo brand primary (`#4f46e5`), muted accents, and subtle borders.
  - Typography: System font stack with progressive fallbacks (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`).
  - Spacing scale: Standardized 4px/8px modular scale (`--spacing-xs` to `--spacing-2xl`).
  - Breakpoints: Mobile (`< 640px`), Tablet (`640px` - `1024px`), Desktop (`> 1024px`).
- **Global Reset (`src/styles/global.css`)**:
  - Box-sizing border-box reset across all elements.
  - Accessible focus rings: Visible 2px outline with 2px offset (`:focus-visible`).
  - Layout stability: `min-height: 100vh` on root container to eliminate layout shift during route transitions.
- **CSS Modules**:
  - Layout & common stylesheets (`Header.module.css`, `Breadcrumbs.module.css`, `CartBadge.module.css`, `Layout.module.css`, `NotFound.module.css`).
  - Catalog stylesheets (`SearchBar.module.css`, `ProductGrid.module.css`, `ProductCard.module.css`, `ProductSkeleton.module.css`, `ProductList.module.css`).
  - Details stylesheets (`ProductImage.module.css`, `ProductDescription.module.css`, `ProductActions.module.css`, `ProductDetailsSkeleton.module.css`, `ProductDetails.module.css`).

---

## 6. Catalog Components Topology (`src/components/catalog/`)

The catalog capability introduced in `ITX-003` is organized into single-responsibility components:

| Component | Path | Responsibility |
| :--- | :--- | :--- |
| `SearchBar` | `src/components/catalog/SearchBar/` | Controlled search input with clear CTA, search icon, result count, and accessible `role="search"`. |
| `ProductGrid` | `src/components/catalog/ProductGrid/` | CSS Grid container enforcing responsive column distribution (max 4 on desktop, 3 on tablet, 2 on small tablet, 1 on mobile). |
| `ProductCard` | `src/components/catalog/ProductCard/` | Device item card displaying image with fallback handler, brand, model, formatted price (`formatPrice`), and Link to `/product/:id`. |
| `ProductSkeleton` | `src/components/catalog/ProductSkeleton/` | Placeholder card matching `ProductCard` dimensions with shimmer animation to prevent layout shifts. |

See [docs/flows/catalog-browsing.md](flows/catalog-browsing.md) for sequence flows and caching lifecycle details.

---

## 7. Product Details Components Topology (`src/components/details/`)

The product details and cart capability introduced in `ITX-004` is organized into dedicated components adhering to the two-column layout (`PDP.png`):

| Component | Path | Responsibility |
| :--- | :--- | :--- |
| `ProductImage` | `src/components/details/ProductImage/` | Column 1: Presents the device photo with natural aspect ratio container, accessible alt text, and graceful broken image fallback. |
| `ProductDescription` | `src/components/details/ProductDescription/` | Column 2: Displays Brand, Model, Price (`formatPrice`), and structured technical specifications table (CPU, RAM, OS, Resolution, Battery, Cameras, Dimensions, Weight) with null-safe fallbacks. |
| `ProductActions` | `src/components/details/ProductActions/` | Column 2: Manages Storage and Color variant selectors with mandatory default pre-selection, "Add to cart" CTA button with in-flight disable state, and error/success alerts. |
| `ProductDetailsSkeleton` | `src/components/details/ProductDetailsSkeleton/` | Shimmer loading placeholder mirroring the two-column desktop/tablet layout and single-column mobile view to eliminate CLS (Cumulative Layout Shift). |

See [docs/flows/product-details-cart.md](flows/product-details-cart.md) for sequence flows, variant pre-selection, and cart mutation details.

---

## 8. Verification and Compliance

- **ESLint Compliance**: Strict standard rules enforced without lint warnings.
- **Production Build**: Zero chunk errors; assets bundled into `dist/` with gzip optimization.
- **Automated Tests**: Unit and integration test coverage across all routing, layout, and state contexts.
