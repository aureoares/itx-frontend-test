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
│   ├── CartContext.jsx    # Reactive cart state provider backed by localStorage (itx_cart_count)
│   └── CartContext.test.jsx
├── pages/
│   ├── NotFound/          # 404 fallback page with return to home link
│   ├── ProductDetails/    # PDP view placeholder
│   └── ProductList/       # PLP view placeholder
├── router/
│   └── index.jsx          # React Router v7 createBrowserRouter configuration
├── styles/
│   ├── global.css         # Modern reset, base typography, accessible focus styles
│   └── variables.css      # Design tokens (colors, typography, spacing, shadows, breakpoints)
├── test/
│   ├── setup.js           # Testing library setup & Node/jsdom compatibility layer
│   └── smoke.test.js
├── App.jsx                # Application root with CartProvider and RouterProvider
└── main.jsx               # React DOM entry point
```

For in-depth details on component contracts, data flows, and routing topology, consult [docs/topology.md](docs/topology.md).

---

## 6. SPA Production Deployment & Deep-Linking (Rewrite Rules)

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

## 7. Testing Strategy

The project employs a dual-layer testing approach:
1. **Unit Tests**:
   - `CartContext.test.jsx`: Validates initialization from `localStorage`, state updates via `addToCart` and `setCartCount`, boundaries, and multi-tab storage synchronization.
   - Component tests (`Header`, `Breadcrumbs`, `CartBadge`, `NotFound`): Validates DOM roles, accessibility attributes (`aria-current="page"`, `aria-label`, `role="status"`), and responsive class structures.
2. **Integration Tests**:
   - `AppShell.test.jsx`: Validates end-to-end client routing with memory history, breadcrumb transitions, fallback route handling (404), and cart counter continuity across views.
