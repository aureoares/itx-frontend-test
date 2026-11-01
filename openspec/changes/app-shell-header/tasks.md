# Tasks — Application Shell, Client Routing, and Global Header

## 1. Project Initialization & Tooling Setup

- [x] 1.1 Scaffold project structure with Vite, React 19, and JavaScript (ES6+), configuring `package.json` with required scripts (`start`, `build`, `test`, `lint`) and verify `npm run start` and `npm run build` execute without error.
- [x] 1.2 Configure ESLint and Prettier for strict JavaScript ES6+ code quality standards and verify `npm run lint` passes cleanly.
- [x] 1.3 Configure Vitest and React Testing Library test runner environment (`vitest.config.js`, jsdom setup) and verify a test smoke test passes.

## 2. Core Styling & Design Tokens

- [x] 2.1 Create `src/styles/variables.css` containing design tokens (colors, typography, spacing, shadows, responsive breakpoints) and verify variables load globally.
- [x] 2.2 Create `src/styles/global.css` with modern CSS reset, accessible focus rings, and font configurations, and verify zero layout shifts.

## 3. Client Routing & Cart State Provider

- [x] 3.1 Create `src/context/CartContext.jsx` with `CartProvider` and `useCart()` hook, initializing count from storage (`itx_cart_count`), and verify unit tests confirm state initialization and count updates.
- [x] 3.2 Create `src/components/layout/Layout.jsx` wrapping `<header>` and `<main id="main-content"><Outlet /></main>`, and verify layout landmark structure matches accessibility criteria.
- [x] 3.3 Create `src/pages/NotFound/NotFound.jsx` with 404 message and home navigation link, and verify unit test asserts message and home link presence.
- [x] 3.4 Configure React Router v7 in `src/router/index.jsx` using `createBrowserRouter` with `Layout`, placeholder routes for `/` and `/product/:id`, and catch-all `*` for `NotFound`, and verify route transitions render without page reloads.

## 4. Header & Navigation Components

- [x] 4.1 Implement `src/components/common/Breadcrumbs/Breadcrumbs.jsx` using `<nav aria-label="Breadcrumb">` and `<ol>`, parsing current router path segments with fallback labeling ("Product Details") when dynamic titles are loading, and verify unit tests validate root, dynamic segment fallback, and backward navigation.
- [x] 4.2 Implement `src/components/common/CartBadge/CartBadge.jsx` consuming `useCart()`, rendering accessible `aria-label`, and displaying "0" when empty, and verify tests validate empty and active counts.
- [x] 4.3 Implement `src/components/common/Header/Header.jsx` combining logo link to `/`, `Breadcrumbs`, and `CartBadge` inside sticky container with `Header.module.css`, and verify responsive mobile and desktop layout tests pass.

## 5. Verification & Test Suite

- [x] 5.1 Write comprehensive integration tests in `src/__tests__/AppShell.test.jsx` covering logo home navigation, breadcrumbs on detail views, empty cart badge rendering, and 404 routing, and verify `npm test` passes 100%.
- [x] 5.2 Execute full linting (`npm run lint`) and production compilation (`npm run build`) and verify zero errors, lint warnings, or broken assets.

## 6. Documentation Updates

- [x] 6.1 Create root `README.md` documenting setup, execution instructions, standard scripts, architectural decisions, and SPA production rewrite rules for deep-link 404 mitigation (e.g., Nginx, Netlify), and verify all commands and links work as described.
- [x] 6.2 Update `docs/topology.md` detailing the client architecture, component hierarchy, and routing structure, and verify alignment with `AGENTS.md`.
