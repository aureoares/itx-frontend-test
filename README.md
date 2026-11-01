# ITX Front-End Technical Test — Mobile Device Store

A modern, responsive e-commerce Single-Page Application (SPA) for browsing and purchasing mobile devices, built with **React 19**, **React Router v7 (SPA Library Mode)**, **Vite**, and **Modern CSS**.

---

## 1. Project Overview

This application fulfills the requirements defined in the [ITX Senior Front-End Technical Test](workflow/backlog/raw/ITX-FrontEndTest1_en.md). It delivers a high-performance e-commerce catalog featuring:
- **Product List Page (PLP)**: Responsive product grid (up to 4 items per row) with real-time search filtering by brand and model.
- **Product Details Page (PDP)**: Responsive two-column view displaying technical specifications, storage/color option selectors, and cart actions.
- **Global Application Shell**: Persistent header featuring a brand logo link, dynamic breadcrumb navigation, and an accessible live cart counter badge.
- **Client-Side Persistence & Caching**: 1-hour TTL cached responses for external API requests and cart state persistence across page refreshes and browser sessions.

---

## 2. Technology Stack & Key Constraints

| Technology | Specification & Purpose |
| :--- | :--- |
| **Framework** | **React 19** (`^19.0.0`) |
| **Routing** | **React Router v7** (`^7.0.0`) in **SPA Library Mode** (strictly client-side routing; no SSR/MPA) |
| **Language** | **JavaScript (ES6+)** (strictly no TypeScript per explicit test specification) |
| **Tooling & Bundler** | **Vite 6** with `@vitejs/plugin-react` |
| **Styling** | **Modern CSS & CSS Modules** with CSS custom properties design tokens (`src/styles/variables.css`) |
| **Testing** | **Vitest 3** & **React Testing Library** with `jsdom` |
| **Code Quality** | **ESLint 9** with flat config and Prettier |

For complete architectural rationales and tradeoffs, see [docs/technical-decisions.md](docs/technical-decisions.md).

---

## 3. Getting Started

### Prerequisites
- **Node.js**: `v20.0.0` or higher (verified on Node 20, 22, and 24)
- **npm**: `v10.0.0` or higher

### Installation
Clone the repository and install project dependencies:
```bash
git clone <repository-url>
cd itx-frontend-test
npm install
```

---

## 4. Standard Scripts

As required by the test specification, the following npm scripts are provided:

```bash
# 1. Start development server (runs on http://localhost:3000)
npm run start
# Alternatively:
npm start

# 2. Build production bundle (outputs to dist/)
npm run build

# 3. Run automated test suite (Vitest + React Testing Library)
npm test

# 4. Run linting and code quality checks (ESLint)
npm run lint
```

---

## 5. Architectural Topology

```
src/
├── __tests__/             # Top-level integration test suite (AppShell.test.jsx)
├── components/
│   ├── common/            # Reusable UI components
│   │   ├── Breadcrumbs/   # Semantic accessible breadcrumbs navigation
│   │   ├── CartBadge/     # Live cart counter badge with screen-reader feedback
│   │   └── Header/        # Sticky responsive navigation header
│   └── layout/
│       └── Layout/        # Shell layout wrapping Header and <main id="main-content">
├── context/
│   ├── CartContext.jsx    # Reactive cart state provider backed by cartService
│   └── CartContext.test.jsx
├── pages/
│   ├── NotFound/          # 404 fallback page with return to home link
│   ├── ProductDetails/    # PDP view placeholder
│   └── ProductList/       # PLP view placeholder
├── router/
│   └── index.jsx          # React Router v7 createBrowserRouter configuration
├── services/
│   ├── apiClient.js       # Centralized HTTP fetch client with timeouts & ApiError
│   ├── cartService.js     # Cart mutation & client-side accumulation logic
│   ├── productService.js  # Cached catalog/detail retrieval with 1-hour TTL
│   └── storageService.js   # Envelope storage with corrupted recovery & memory fallback
├── styles/
│   ├── global.css         # Modern reset, base typography, accessible focus styles
│   └── variables.css      # Design tokens (colors, typography, spacing, shadows, breakpoints)
├── test/
│   ├── setup.js           # Testing library setup & Node/jsdom compatibility layer
│   └── smoke.test.js
├── App.jsx                # Application root with CartProvider and RouterProvider
└── main.jsx               # React DOM entry point
```

For domain models and schemas, see [docs/domain.md](docs/domain.md). For in-depth architectural details on component contracts, data flows, and routing topology, consult [docs/topology.md](docs/topology.md).

---

## 6. Client Caching & Persistence Architecture

The data access layer ensures resilient, high-performance interactions with the remote backend:

- **1-Hour Expiration TTL**: Catalog (`/api/product`) and product detail (`/api/product/:id`) responses are stored inside timestamped envelopes (`{ timestamp: number, data: any }`). Lookups within 1 hour (`3,600,000` ms) are served directly from cache with zero network requests. Stale entries trigger automatic on-demand revalidation.
- **Storage Resilience**: Corrupted JSON entries are automatically purged upon read without crashing the application. If `localStorage` is disabled or throws a `QuotaExceededError`, the layer transparently falls back to an in-memory `Map` store for the active session.
- **Cart Accumulation**: Because `POST /api/cart` statelessly returns `{ count: 1 }`, `cartService` maintains and increments the accumulated cart count on the client, persisting it in `itx_cart_count` and broadcasting updates reactively across components and open browser tabs.

---

## 7. SPA Production Deployment & Deep-Linking (Rewrite Rules)

In a pure Single-Page Application using HTML5 `pushState` history routing (such as React Router v7 in SPA mode), direct requests or browser refreshes on nested routes (e.g. `https://domain.com/product/1001` or `/unknown-path`) will result in an HTTP 404 from static web servers unless requests are rewritten to `index.html`.

Below are recommended production server configurations:

### Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/itx-frontend-test/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Netlify
Add a `_redirects` file in the `public/` directory (or configure `netlify.toml`):
```text
/*    /index.html   200
```

### Apache (`.htaccess`)
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Local Production Preview
To preview the production bundle locally with proper SPA fallback handling:
```bash
npm run build
npx vite preview --port 3000
```

---

## 8. Testing Strategy

The project employs a comprehensive testing approach covering unit, domain, and integration levels:
1. **Service & Domain Unit Tests**:
   - `apiClient.test.js`: Validates `GET /api/product`, `GET /api/product/:id`, `POST /api/cart`, HTTP 404/500 errors, timeout aborts (408), and network disconnects.
   - `storageService.test.js`: Validates envelope storage `{ timestamp, data }`, malformed JSON recovery, and `QuotaExceededError` in-memory fallback.
   - `productService.test.js`: Validates 1-hour TTL boundary using Vitest fake timers (`vi.useFakeTimers()`), zero-network cache hits (< 1h), and lazy revalidation (> 1h).
   - `cartService.test.js` & `CartContext.test.jsx`: Validates cart count accumulation against stateless mock API responses, state mutation flags, and multi-tab storage synchronization.
2. **Component & Shell Integration Tests**:
   - Component tests (`Header`, `Breadcrumbs`, `CartBadge`, `NotFound`): Validates DOM landmark roles, accessibility attributes (`aria-current="page"`, `aria-label`, `role="status"`), and responsive class structures.
   - `AppShell.test.jsx`: Validates end-to-end client routing with memory history, breadcrumb transitions, fallback route handling (404), and cart counter continuity across views.

