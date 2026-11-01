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

### 4.1 Cart State (`src/context/CartContext.jsx`)
- **Storage Key**: `itx_cart_count` stored in `localStorage`.
- **State Initialization**: Lazy initializer reads and parses `localStorage.getItem('itx_cart_count')`, defaulting to `0` on parse failure or missing value.
- **Mutations**:
  - `addToCart(amount = 1)`: Increments counter and immediately writes new value to `localStorage`.
  - `setCartCount(count)`: Updates count to an exact non-negative integer and writes to `localStorage`.
- **Cross-Tab Synchronization**: Listens for window `'storage'` events to reflect cart updates across multiple active browser tabs in real time.

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
  - Component-level scoped stylesheets (`Header.module.css`, `Breadcrumbs.module.css`, `CartBadge.module.css`, `Layout.module.css`, `NotFound.module.css`).

---

## 6. Verification and Compliance

- **ESLint Compliance**: Strict standard rules enforced without lint warnings.
- **Production Build**: Zero chunk errors; assets bundled into `dist/` with gzip optimization.
- **Automated Tests**: Unit and integration test coverage across all routing, layout, and state contexts.
