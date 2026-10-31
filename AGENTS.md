# AGENTS.md — Agent Directives & Engineering Standards

Welcome to the **ITX Front-End Technical Test** repository. This document defines the engineering standards, technology stack, functional requirements, and development workflow that every AI agent and developer must adhere to.

---

## 1. Project Overview & Role

- **Context**: Technical test for a **Senior Frontend Engineer**.
- **Deliverable**: A responsive e-commerce Single-Page Application (SPA) for browsing and purchasing mobile devices.
- **Specification Source**: [workflow/backlog/raw/ITX-FrontEndTest1_en.md](workflow/backlog/raw/ITX-FrontEndTest1_en.md).
- **Primary Process Guide**: [workflow/backlog/user-guide.md](workflow/backlog/user-guide.md).

> [!IMPORTANT]
> **Senior Engineering Standard**: Solutions are expected to demonstrate clean architecture, robust state management, resilient error handling, accessibility, comprehensive test coverage, and premium visual design.

---

## 2. Workflow & Process Enforcement (Spec-Driven Development)

Agents must strictly follow the spec-driven development loop detailed in [user-guide.md](workflow/backlog/user-guide.md):

$$\text{Discover} \longrightarrow \text{Architect} \longrightarrow \text{Design} \longrightarrow \text{Code}$$

### Core Operating Rules

1. **Spec $\rightarrow$ Plan $\rightarrow$ Code**:
   - Code is the **last** artifact produced, never the first.
   - Do not implement code changes without an active OpenSpec change and task checklist (`openspec/changes/<name>/tasks.md`).
2. **Backlog Items vs. Implementation Tasks**:
   - **Backlog Items** (`workflow/backlog/items/<id>-<slug>.md`): Customer/domain deliverables with Gherkin acceptance criteria (`Given / When / Then`).
   - **Tasks** (`openspec/changes/<name>/tasks.md`): Engineering checklists executed during `/opsx:apply`.
3. **Traceability Chain**:
   $$\text{Discovery} \rightarrow \text{Backlog Item} \rightarrow \text{Change} \rightarrow \text{Task step} \rightarrow \text{Commit} \rightarrow \text{PR}$$
4. **Spec Drift Rule**:
   - Never diverge silently from specs during implementation. If requirements or code drift, run `/opsx:sync` to realign the specification before resuming implementation.
5. **Git & Branching Conventions**:
   - Consult [workflow/config.yaml](workflow/config.yaml) for branch names and rules.
   - `main` is protected and release-only.
   - Integration branch is `develop`.
   - Feature branches follow: `feature/<item-id>-<change-name>` or `feature/<change-name>`.
   - Commits must follow [Conventional Commits](https://www.conventionalcommits.org) format (e.g., `feat(plp): implement real-time search filtering`).

---

## 3. Technology Stack & Constraints

Based strictly on [ITX-FrontEndTest1_en.md](workflow/backlog/raw/ITX-FrontEndTest1_en.md):

| Category | Specification / Constraint |
| :--- | :--- |
| **Framework / Routing** | **React 19** with **React Router v7** (SPA Library Mode). Client-side routing only; strictly no SSR or MPA. |
| **Language** | **JavaScript (ES6+)**. *Explicit constraint*: Preferably **no TypeScript**. |
| **Styling** | Modern CSS / Vanilla CSS / CSS Modules. High aesthetic quality, responsive, adhere strictly to visual screenshots (`PLP.png`, `PDP.png`). |
| **Tooling / Bundler** | **Vite** (recommended modern boilerplate for SPA React development). |
| **Testing** | Vitest with React Testing Library (`@testing-library/react`). Unit and integration tests for critical business logic (cache, cart, filtering). |
| **Linting & Quality** | ESLint + Prettier. |

### Required `package.json` Scripts

The project must provide the following standard scripts:

1. `npm run start` (or `npm start`): Development mode server.
2. `npm run build`: Production compilation and bundle generation.
3. `npm test`: Run test suites.
4. `npm run lint`: Code quality and linting checks.

---

## 4. Architecture & Functional Requirements

### 4.1 Views (Strictly Two Views)

1. **PLP — Product List Page** (`/`):
   - Fetches and displays all items from the API.
   - **Search & Filter**: Real-time filtering comparing user query against product `brand` and `model`.
   - **Grid Layout**: Maximum 4 items per row, responsive across device resolutions.
   - Clicking any item navigates to its Product Details Page (PDP).

2. **PDP — Product Details Page** (`/product/:id`):
   - Two-column responsive layout:
     - **Column 1**: Product image component (`IMAGE`).
     - **Column 2**: Product details (`DESCRIPTION`) and actions (`ACTIONS`).
   - Breadcrumbs or back link to navigate to the product list.
   - **Product Attributes Displayed**: Brand, Model, Price, CPU, RAM, Operating System, Screen resolution, Battery, Cameras, Dimensions, Weight.
   - **Product Actions**:
     - **Storage selector** & **Colors selector**: Even if there is only 1 option available, the selector must be displayed and selected by default.
     - **Add button**: Adds product to the cart via API.
     - Cart item counter update reflected across the app.

### 4.2 Shared Components

- **Header (`HEADER`)**:
  - Application title/logo linking to the main view (`/`).
  - Breadcrumbs showing the current page and navigation links.
  - Cart counter on the right displaying the total number of items in the cart.
- **Search Bar (`SEARCH`)**: Text input for real-time filtering.
- **List Item (`ITEM`)**: Shows product Image, Brand, Model, and Price.
- **Product Image (`IMAGE`)**: Product visual presentation.
- **Product Description (`DESCRIPTION`)**: Technical specifications list.
- **Product Actions (`ACTIONS`)**: Attribute selectors and "Add to cart" CTA.

### 4.3 API Integration & Endpoints

- **Base Domain**: `https://itx-frontend-test.onrender.com/`
- **Endpoints**:
  - `GET /api/product` $\rightarrow$ Returns array of product items.
  - `GET /api/product/:id` $\rightarrow$ Returns product detail object.
  - `POST /api/cart` $\rightarrow$ Request body: `{ "id": 1001, "colorCode": 1, "storageCode": 2 }`. Response: `{ "count": 1 }`.

### 4.4 Data Persistence & Client-Side Caching

- **Cache Requirement**: All API responses must be cached locally upon fetching.
- **TTL / Expiration**: Cached responses expire after **1 hour**.
- **Revalidation**: Once the 1-hour window expires, data must be fetched anew from the API on subsequent requests.
- **Storage Strategy**: LocalStorage, SessionStorage, IndexedDB, or an in-memory/browser cache mechanism with timestamp tracking.
- **Cart Persistence**: Cart item count must persist across page navigations, browser refreshes, and views.

---

## 5. Senior Engineering Best Practices

- **Resilience**: Handle API errors, loading states (skeletons/spinners), and empty search results gracefully.
- **State Management**: Clean, centralized, and decoupled state for cart and cache (e.g., custom React hooks or Context API).
- **Accessibility**: Semantic HTML5 tags (`<main>`, `<header>`, `<nav>`, `<section>`), proper `alt` attributes, keyboard accessibility for selectors and buttons.
- **Documentation**: Maintain a comprehensive `README.md` in the repository covering:
  - Setup and execution instructions.
  - Architectural decisions and directory structure.
  - Caching and persistence mechanisms.
  - Testing strategy.

---

## 6. Directory Structure Reference

```
.
├── AGENTS.md                  # This file: Agent instructions and standards
├── README.md                  # Project overview, setup, and architecture documentation
├── docs/                      # Architectural & technical decisions (docs/technical-decisions.md)
├── workflow/
│   ├── config.yaml            # Pipeline config (git, branches, Jira)
│   ├── templates/             # discovery.md, item.md, pr-description.md
│   └── backlog/
│       ├── raw/               # Original test specifications (ITX-FrontEndTest1_en.md)
│       ├── discovery/         # Requirements discovery documents (/discover)
│       ├── items/             # Backlog items (/architect, /item-enrich)
│       ├── exports/           # Jira markup and PR descriptions
│       └── user-guide.md      # Spec-driven development guide
├── .agents/                   # Custom agents, commands, rules, workflows, skills
├── openspec/                  # OpenSpec configuration, delta changes, and living specs
└── src/                       # Application source code (React SPA)
```
