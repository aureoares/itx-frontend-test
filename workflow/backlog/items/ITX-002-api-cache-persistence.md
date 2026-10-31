---
id: ITX-002
title: API Client and 1-Hour Cache Persistence Service
status: enriched
discovery: product-catalog
change: ~
priority: must
estimate: 3 SP
language: en
---

# ITX-002 — API Client and 1-Hour Cache Persistence Service

## Goal

Provide a centralized API client and caching layer that stores all device catalog and detail responses locally with a 1-hour expiration Time-to-Live (TTL), revalidating upon expiry, while persisting cart count across browser sessions, so network requests are minimized and user state is preserved.

## Context

- Integrates with the remote API (`https://itx-frontend-test.onrender.com/`).
- Wraps `localStorage` (with an in-memory fallback) to store envelope objects `{ timestamp: number, data: any }`.
- Crucial for Senior Engineer evaluation: robust cache invalidation, revalidation, and isolated state management.
- Handles cart count persistence in `localStorage` to accumulate counts across additions against the stateless mock API.
- **Documentation impacts:** Updates `docs/domain.md` (`CacheEnvelope`, `CartState`) and `docs/topology.md` (data access and persistence layer).

## Acceptance criteria

```gherkin
Scenario: Successful API fetch stores data with timestamp
  Given no cached data exists for endpoint "/api/product"
  When the application requests the product catalog
  Then the data is retrieved from "https://itx-frontend-test.onrender.com/api/product"
  And the response is stored in local storage with the current timestamp and a 1-hour TTL

Scenario: Subsequent request within 1 hour serves from cache
  Given valid cached data for "/api/product" was stored 30 minutes ago
  When the application requests the product catalog
  Then the data is served directly from the local cache
  And no network request is sent to the remote API

Scenario: Expired cache triggers revalidation
  Given cached data for endpoint "/api/product" was stored 65 minutes ago
  When the application requests the product catalog
  Then the cache is recognized as expired
  And a new network request is made to the API to refresh the stored data and update the timestamp

Scenario: Cart counter increments and persists upon mutation
  Given the current stored cart count is 1
  When the cart service executes a mutation with product id "ZmGrkLRPXOTpxsU4jjAcv", colorCode 1000, and storageCode 2000
  And the API responds with {"count": 1}
  Then the cart service increments the total count to 2
  And the updated count of 2 is persisted in storage and broadcast to components

Scenario: Cart count persists across browser reloads
  Given the user has accumulated a cart count of 2
  When the user refreshes the browser or opens a new session
  Then the stored cart count of 2 is restored and available to all components

Scenario: Unhappy path - API network failure with expired cache
  Given the cached data for "/api/product/:id" is expired or empty
  And the remote API returns an HTTP 500 error or network timeout
  Then the service raises a catchable API error with clear user diagnostic details
  And the application does not crash

Scenario: Unhappy path - Corrupted cache recovery
  Given local storage contains malformed JSON or an invalid envelope for "/api/product"
  When the application requests the product catalog
  Then the service safely handles the parsing failure without throwing an unhandled exception
  And removes the corrupted cache entry
  And retrieves fresh data from the remote API

Scenario: Fallback when browser storage is disabled or quota is exceeded
  Given localStorage is unavailable (e.g., privacy settings) or throws a QuotaExceededError
  When the application performs caching or cart operations
  Then the service seamlessly delegates to an in-memory storage fallback
  And data operations complete successfully for the active session
```

## Notes & edge cases

- **Cache Envelope Structure**:
  ```json
  {
    "timestamp": 1730386800000,
    "data": [...]
  }
  ```
- **TTL Window**: Calculated as `Date.now() - timestamp < 3600000` (1 hour).
- **Namespaced Storage Keys**: Use consistent key prefixes (e.g. `itx_cache_products`, `itx_cache_product_<id>`, `itx_cart_count`) to avoid collisions.
- **Reactivity**: Cart updates should trigger a state change via a React Context or custom hook (`useCart`) so the Header badge updates immediately without page reload.
- **Testing Strategy**: Automated unit tests using Vitest fake timers (`vi.useFakeTimers()`) to verify expiration boundary (59 mins vs 61 mins) and localStorage mock failures.

## Estimate

**3 Story Points**

*Rationale*: Covers building the storage abstraction with TTL validation, error boundaries for corrupted/quota-exceeded storage, HTTP fetch client with error handling, cart accumulation logic, React Context/Hook integration, and unit tests with mocked timers and API endpoints.

## Definition of Done

- [ ] Acceptance criteria covered by tests
- [ ] Spec deltas archived in openspec/specs/
- [ ] Work merged into the integration branch
