# Design — API Client and 1-Hour Cache Persistence Service

## Context

The application is a pure client-side React 19 SPA (React Router v7 Library Mode) that communicates with an external REST API at `https://itx-frontend-test.onrender.com/`. See [proposal.md](proposal.md) for full motivation and scope.

Existing state:
- [src/context/CartContext.jsx](../../../src/context/CartContext.jsx) manages a client counter initialized from `localStorage` (`itx_cart_count`).
- Standard test runner (Vitest 3 + jsdom) and ESLint 9 are operational.
- No HTTP client, caching service, or domain data services currently exist.

## Goals / Non-Goals

**Goals:**
- Provide a clean, layered service architecture decoupling network communication (`apiClient`), storage management (`storageService`), and domain caching (`productService`, `cartService`).
- Enforce exact 1-hour (3,600,000 ms) TTL cache validation with lazy revalidation on demand.
- Provide zero-crash error handling for network timeouts, HTTP 4xx/5xx, corrupted storage entries, and storage quota exceptions.
- Provide seamless in-memory fallback when browser `localStorage` is inaccessible.
- Ensure cart mutations persist and update the Header cart badge across views and browser tabs.

**Non-Goals:**
- Rendering UI components for the product catalog (deferred to `ITX-003`).
- Rendering product details, selectors, or the Add to Cart button (deferred to `ITX-004`).
- Complex client-side shopping cart checkout flows (spec only requires cart item counter persistence).

## Decisions

### 1. Layered Data Access Architecture

```
[ React Components / Context (UI Layer) ]
            │                │
            ▼                ▼
    [ productService ]  [ cartService ]  (Domain Services)
            │                │
      ┌─────┴──────┐         │
      ▼            ▼         ▼
[ storageService ]   [ apiClient ]        (Core Infrastructure)
      │                    │
      ▼                    ▼
[ localStorage / Memory ] [ Remote REST API ]
```

- **`src/services/apiClient.js`**: Low-level HTTP transport wrapper using native `fetch`. Configures base URL (`https://itx-frontend-test.onrender.com/`), default request timeouts (10 seconds via `AbortController`), JSON serialization, and normalized error classes (`ApiError`).
- **`src/services/storageService.js`**: Encapsulates all browser persistence with key prefixing (`itx_`). Manages cache envelopes (`{ timestamp: number, data: any }`), corrupted JSON recovery, and automatic in-memory fallback.
- **`src/services/productService.js`**: Domain service orchestrating product catalog (`/api/product`) and product detail (`/api/product/:id`) lookups with cache TTL validation.
- **`src/services/cartService.js`**: Domain service coordinating cart mutations against `POST /api/cart` and state updates.

*Alternative considered:* Embedding caching logic directly into React query hooks or component state.  
*Rationale:* Decoupling transport, caching, and state allows each layer to be tested in isolation with deterministic unit tests and zero UI rendering overhead.

---

### 2. Caching Strategy and 1-Hour Expiration TTL

- **TTL Constant**: Exactly 1 hour:
  ```javascript
  const CACHE_TTL_MS = 60 * 60 * 1000; // 3,600,000 ms
  ```
- **Cache Envelope Structure**:
  ```json
  {
    "timestamp": 1730460000000,
    "data": [ ... ]
  }
  ```
- **Storage Keys**:
  - Catalog list: `itx_cache_products`
  - Product detail: `itx_cache_product_${id}`
  - Cart counter: `itx_cart_count`
- **Revalidation Flow**:
  1. Check `storageService.get(key)`.
  2. If an envelope exists and `(Date.now() - envelope.timestamp) < CACHE_TTL_MS`:
     - Return `envelope.data` directly (Cache Hit — zero network traffic).
  3. If envelope is missing, corrupted, or `(Date.now() - envelope.timestamp) >= CACHE_TTL_MS`:
     - Fetch fresh data from `apiClient` (Cache Miss / Expired).
     - Store new envelope `{ timestamp: Date.now(), data }` in `storageService`.
     - Return fresh data.

*Alternative considered:* Background polling with `setInterval` to periodically refresh cached entries.  
*Rationale:* Lazy, on-demand revalidation avoids wasteful CPU and network consumption while the user is idle or in other views.

---

### 3. Storage Resilience and In-Memory Fallback

- If `localStorage.getItem` returns unparseable or corrupted JSON:
  - `storageService` safely catches the `SyntaxError`.
  - Automatically purges the corrupted key via `localStorage.removeItem(key)`.
  - Returns `null`, smoothly triggering a remote fetch.
- If `localStorage.setItem` throws `QuotaExceededError` or `SecurityError` (e.g. storage disabled in strict private mode):
  - `storageService` catches the exception.
  - Automatically activates an internal `Map`-based in-memory store.
  - All subsequent reads and writes for the active session succeed transparently in memory.

---

### 4. Cart Accumulation and Reactivity

- The remote API endpoint `POST /api/cart` with payload `{ id, colorCode, storageCode }` returns `{ count: 1 }` statelessly.
- `cartService.addDeviceToCart(payload)` issues the POST request to `apiClient`.
- Upon successful response, the local cart counter is incremented by 1 and persisted to `itx_cart_count`.
- `CartContext` is enhanced to support async cart mutations (`addToCart(payload)`), exposing loading states and error notifications while updating the reactive `cartCount`.
- Header cart counter continues to synchronize reactively across all views and open browser tabs via the window `storage` event.

---

### 5. Domain Models Documentation

- Define canonical models in a new `docs/domain.md`:
  - `CacheEnvelope`: `{ timestamp: number, data: any }`
  - `CartMutationPayload`: `{ id: string, colorCode: number, storageCode: number }`
  - `CartState`: `{ cartCount: number, isMutating: boolean }`
  - `ApiError`: Normalized exception class containing HTTP status, message, and diagnostic info.

---

## Risks / Trade-offs

- **[Risk: LocalStorage size quota limit with large device catalogs]**  
  → *Mitigation*: The device catalog contains ~100 devices and individual details are ~2KB each, totaling under 250KB (well below browser 5MB storage limits). If quota is exceeded, `storageService` automatically falls back to in-memory caching.
- **[Risk: Corrupted storage blocking application load]**  
  → *Mitigation*: All `JSON.parse` operations are encapsulated within `try/catch` blocks inside `storageService`; corrupted keys are purged immediately and fresh data is fetched.
- **[Risk: Stale mock cart endpoint returning fixed count]**  
  → *Mitigation*: The client treats `POST /api/cart` strictly as an operation confirmation and maintains accumulated cart quantity on the client, persisting it in `itx_cart_count`.
- **[Risk: Clock skew or manual system clock modifications]**  
  → *Mitigation*: `Date.now()` is validated against non-negative elapsed time; negative elapsed time is treated as expired and revalidated.
