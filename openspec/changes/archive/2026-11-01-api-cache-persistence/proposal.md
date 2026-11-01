# Proposal — API Client and 1-Hour Cache Persistence Service

## Why

The application integrates with an external REST API (`https://itx-frontend-test.onrender.com/`) to retrieve device catalog lists, fetch detailed specifications, and record cart additions. The specification mandates that all client API responses must be cached locally for exactly 1 hour (3,600,000 ms) before revalidating against the remote service, and that shopping cart additions must accumulate and persist across sessions against a stateless mock API.

Without a centralized API client and caching layer:
1. Navigation between views would trigger redundant, unthrottled remote network requests, degrading performance.
2. Expired, corrupted, or disabled browser storage would cause unhandled exceptions or application crashes.
3. Cart state would reset to 1 on subsequent additions or lose tracking upon page refresh.

Originating Backlog Item: [workflow/backlog/items/ITX-002-api-cache-persistence.md](../../../workflow/backlog/items/ITX-002-api-cache-persistence.md)

## What Changes

- Create a centralized HTTP API client (`apiClient`) with standardized error handling and timeout tolerance for all remote endpoints (`GET /api/product`, `GET /api/product/:id`, `POST /api/cart`).
- Implement an envelope-based storage service (`storageService`) managing cached entries with timestamped envelopes (`{ timestamp, data }`), 1-hour TTL validation, corrupted JSON recovery, and seamless in-memory fallback when `localStorage` is disabled or full (`QuotaExceededError`).
- Implement a cached product service (`productService`) coordinating cache lookups, expiry revalidations, and remote API calls.
- Integrate cart accumulation service (`cartService`) with `CartContext` to persist item counts and broadcast mutations reactively across components and browser tabs.
- Document domain models (`CacheEnvelope`, `CartState`) in `docs/domain.md` and update `docs/topology.md`.

### Non-Goals (Out of Scope)
- Product List Page (PLP) catalog layout, grid rendering, and search bar filtering UI (addressed in `ITX-003`).
- Product Details Page (PDP) layout, attribute descriptions, color/storage option selectors, and "Add to cart" CTA UI (addressed in `ITX-004`).

## Capabilities

### New Capabilities
- `api-cache`: Centralized HTTP client, 1-hour TTL cache persistence, automatic revalidation, corrupted storage recovery, in-memory fallback, and cart accumulation persistence.

### Modified Capabilities
*(None. `app-shell` header and layout requirements remain intact; the existing `CartContext` integrates directly with the new persistence and cart services).*

## Impact

- **New Services**: `src/services/apiClient.js`, `src/services/storageService.js`, `src/services/productService.js`, `src/services/cartService.js`.
- **Existing Context**: `src/context/CartContext.jsx` connects to `cartService` and `storageService`.
- **Documentation**: New `docs/domain.md` and updated `docs/topology.md`.
- **Testing**: Dedicated unit tests covering API fetching, 59m/61m cache TTL boundaries via fake timers, quota exceeded fallback, and corrupted envelope recovery.
