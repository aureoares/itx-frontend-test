# Proposal — Application Shell, Client Routing, and Global Header

**Originating Backlog Item:** [workflow/backlog/items/ITX-001-app-shell-header.md](workflow/backlog/items/ITX-001-app-shell-header.md)  
**Discovery Source:** [workflow/backlog/discovery/product-catalog.md](workflow/backlog/discovery/product-catalog.md)  
**Issue Tracker ID:** `ITX-001`

---

## Why

The mobile device e-commerce application requires a clean, accessible, and extensible Single-Page Application (SPA) foundation before implementing domain-specific catalog browsing and detail views. Providing a unified application shell with client-side routing and a sticky global header ensures persistent branding, seamless navigation between views, and real-time visibility of cart status across the entire shopping journey.

---

## What Changes

- Initialize the project workspace with **React 19**, **Vite**, and **JavaScript (ES6+)** following Senior Frontend engineering standards without TypeScript.
- Configure client-side routing using **React Router v7** in SPA Library Mode (`createBrowserRouter` / `RouterProvider`) without SSR or MPA overhead.
- Implement the root `Layout` component providing consistent max-width containers, header placement, and accessible `<main>` view landmarks.
- Implement the sticky `Header` component:
  - Application title/logo linking to the root Product List Page (`/`).
  - Dynamic breadcrumbs indicating navigation hierarchy and providing backward links.
  - Cart counter badge prominently displaying the current number of items in the cart (retrieved from reactive cart state).
- Implement a responsive 404 Not Found fallback view with a return link to `/`.
- Establish standard script definitions in `package.json` (`start`, `build`, `test`, `lint`) with Vitest and ESLint configured.

### Non-Goals (Out of Scope)

- Catalog API fetching, caching layer, and data persistence (scoped to `ITX-002`).
- Product List Page grid and search filtering UI (scoped to `ITX-003`).
- Product Details Page attributes, selectors, and cart mutation API (scoped to `ITX-004`).
- Checkout, payment, user authentication, or server-side rendering.

---

## Capabilities

### New Capabilities

- `app-shell`: Defines application routing structure, shared layout landmark containers, 404 fallback routing, and the global sticky header with breadcrumb navigation and cart status indicator.

### Modified Capabilities

*(None - greenfield implementation)*

---

## Impact

- **File Tree**: Establishes `/src` directory structure, `/src/components/common/Header`, `/src/components/layout/Layout`, and `/src/router`.
- **Dependencies**: Adds `react`, `react-dom`, `react-router-dom` (v7), and dev dependencies (`vite`, `@vitejs/plugin-react`, `vitest`, `@testing-library/react`, `eslint`).
- **Documentation**: Updates `docs/topology.md` and `docs/README.md`.
