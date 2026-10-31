---
topic: product-catalog
date: 2026-10-31
status: ready
language: en
---

# Discovery — product-catalog

> Output of `/discover`. Raw material for `/architect`.

## Context

- **Stakeholders:** Technical Evaluation Committee, Senior Frontend Engineer candidate, prospective mobile device shoppers.
- **Problem statement:** The organization needs a production-grade, highly responsive e-commerce Single-Page Application (SPA) for browsing and purchasing mobile devices, demonstrating senior frontend engineering standards.
- **Current behavior / pain:** Lack of a unified, high-performing device catalog with real-time search filtering, client-side caching to reduce server latency, and reliable cart state persistence across page navigations.
- **Business goal / success metric:** Deliver a clean, accessible, and thoroughly tested React 19 SPA matching the provided layout specifications, adhering to a strict 1-hour cache expiration policy, and providing zero-friction execution via standard npm scripts (`start`, `build`, `test`, `lint`).

## Functional needs

- `[Must]` As a user, I want to browse the full catalog of mobile devices on the Product List Page (PLP) arranged in a responsive grid displaying a maximum of 4 items per row.
- `[Must]` As a user, I want each item card on the PLP to display the device image, brand, model, and price.
- `[Must]` As a user, I want to filter the product list in real time by typing into a search input that matches query text against device brand and model (case-insensitive substring match).
- `[Must]` As a user, I want clear visual feedback (e.g., empty state message) when no devices match the search criteria.
- `[Must]` As a user, I want to select any device on the PLP to navigate directly to its Product Details Page (PDP).
- `[Must]` As a user, I want to view detailed technical specifications for the selected device on the PDP, organized into a two-column layout (Column 1: device image; Column 2: details and actions).
- `[Must]` As a user, I want the PDP to display at least the following attributes: Brand, Model, Price, CPU, RAM, Operating System, Screen resolution, Battery, Cameras, Dimensions, and Weight.
- `[Must]` As a user, I want to choose from available Storage and Color selectors on the PDP, with options displayed and pre-selected by default even if only a single option exists.
- `[Must]` As a user, I want an "Add" button on the PDP that submits the selected device configuration (`id`, `colorCode`, `storageCode`) to the cart API (`POST /api/cart`).
- `[Must]` As a user, I want the total count of items in my cart prominently displayed in the header across all views, updating immediately upon adding a product and persisting across refreshes.
- `[Must]` As a user, I want breadcrumbs in the header displaying navigation hierarchy with links to return back to the main product list.
- `[Should]` As a user, I want visual loading indicators (spinners or skeletons) while device lists and details are asynchronously retrieved from the API.
- `[Should]` As a user, I want user-friendly error messages with retry options when API requests fail or a product is not found.

## Non-functional needs

- **Performance & Caching:** All API responses (`GET /api/product` and `GET /api/product/:id`) MUST be cached locally on the client for 1 hour. Requests within the 1-hour window must be served from cache; subsequent requests after 1 hour must revalidate against the API.
- **Responsiveness:** Fluid responsive design adapting from mobile resolutions up to desktop (1–2 columns on mobile/tablet, up to 4 columns on desktop for PLP; stacked single-column to 2-column layout for PDP).
- **Design & Layout Fidelity:** Visual presentation must strictly adhere to the layout and structure shown in the specification screenshots (`PLP.png` and `PDP.png`).
- **Accessibility (a11y):** Semantic HTML5 landmarks (`<header>`, `<nav>`, `<main>`, `<section>`), proper `alt` attributes on device images, keyboard-operable selectors and buttons, and appropriate ARIA attributes.
- **Code Quality & Testing:** High test coverage (unit and integration tests via Vitest and React Testing Library) covering the cache TTL mechanism, real-time search filtering, and cart state synchronization. Strict compliance with ESLint.

## System & documentation impacts

- **Domain (`docs/domain.md`):** Define core domain models and entities: `ProductSummary`, `ProductDetail`, `ColorOption`, `StorageOption`, `CartState`, `CacheEnvelope`.
- **Topology (`docs/topology.md`):** Document client application architecture: UI Layer (Pages & Components) $\rightarrow$ State & Custom Hooks $\rightarrow$ Cache/Storage Manager $\rightarrow$ API Client Service $\rightarrow$ External API (`https://itx-frontend-test.onrender.com/`).
- **Flows (`docs/flows/`):** Document user flows: Catalog browsing with cache hit/miss, search filtering, product configuration selection, and cart addition mutation.
- **Setup (`docs/README.md`):** Root documentation covering setup, environment prerequisites, dev server execution, build pipeline, test running, and cache architecture explanation.

## Constraints & assumptions

- **Framework & Routing:** React 19 with React Router v7 in SPA Library Mode. Pure client-side routing; strictly no SSR and no MPA.
- **Language:** JavaScript (ES6+). Adhere to explicit specification constraint: preferably no TypeScript.
- **Tooling:** Vite for dev server, HMR, and production bundling.
- **Styling:** Vanilla CSS / Modern CSS Modules with zero runtime dependencies.
- **API External Service:** External mock API at `https://itx-frontend-test.onrender.com/`. Cold-start latency on free tier must be tolerated with resilient loading/error states.
- **Required Scripts:** Standard `npm run start`, `npm run build`, `npm test`, and `npm run lint`.

## Out of scope

- Checkout flow, payment processing, shipping address forms, and order placement.
- User accounts, authentication, registration, and login sessions.
- Order management, order tracking, and purchase history views.
- Any views beyond the two required: PLP (`/`) and PDP (`/product/:id`).
- Backend/API modifications or custom server implementations.

## Open questions

*None. All requirements, constraints, and scope boundaries have been clarified and verified against the specification source.*
