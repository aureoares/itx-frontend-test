# Tasks — API Client and 1-Hour Cache Persistence Service

## 1. HTTP API Client

- [x] 1.1 Implement `src/services/apiClient.js` configuring base URL (`https://itx-frontend-test.onrender.com/`), request timeout handling (10s abort signal), JSON parsing, and normalized `ApiError` class for `GET /api/product`, `GET /api/product/:id`, and `POST /api/cart`.
- [x] 1.2 Write unit tests in `src/services/apiClient.test.js` validating successful fetches, HTTP 404/500 errors, network timeouts, and verify all tests pass.

## 2. Storage & Caching Layer

- [x] 2.1 Implement `src/services/storageService.js` with key prefixing (`itx_`), envelope serialization `{ timestamp, data }`, corrupted JSON recovery, and automatic in-memory fallback on `QuotaExceededError` or disabled `localStorage`.
- [x] 2.2 Write unit tests in `src/services/storageService.test.js` covering envelope storage, recovery from malformed JSON, and quota exceeded fallback behavior, and verify all tests pass.

## 3. Product Domain Service with 1-Hour TTL

- [x] 3.1 Implement `src/services/productService.js` coordinating `storageService` and `apiClient` for `getProducts()` and `getProductById(id)`, enforcing the 1-hour (`3,600,000` ms) TTL boundary and automatic revalidation on cache expiration.
- [x] 3.2 Write unit tests in `src/services/productService.test.js` utilizing Vitest fake timers (`vi.useFakeTimers()`) to verify cache hits within 1 hour (e.g. 59 minutes, zero network calls), cache expiry revalidations (e.g. 61 minutes, new API fetch), and verify all tests pass.

## 4. Cart Accumulation & State Integration

- [x] 4.1 Implement `src/services/cartService.js` coordinating `apiClient.postAddToCart()` and updating accumulated cart counts in storage (`itx_cart_count`).
- [x] 4.2 Update `src/context/CartContext.jsx` to integrate with `cartService.addDeviceToCart(payload)`, providing reactive accumulation, loading/mutating state, and cross-tab storage synchronization.
- [x] 4.3 Write unit and integration tests in `src/services/cartService.test.js` and update `src/context/CartContext.test.jsx` verifying cart accumulation upon mutation and state restoration across reloads, and verify all tests pass.

## 5. Domain & Architectural Documentation

- [x] 5.1 Create `docs/domain.md` defining canonical domain models (`CacheEnvelope`, `CartMutationPayload`, `CartState`, `ApiError`) and persistence contracts.
- [x] 5.2 Update `docs/topology.md` and `README.md` documenting the data access layer, caching strategy, and resilience patterns, and verify all document links work.

## 6. End-to-End Verification & Quality Gate

- [x] 6.1 Execute full test suite (`npm test`) and verify 100% test pass rate across all unit and integration tests.
- [x] 6.2 Execute code quality checks (`npm run lint`) and production build (`npm run build`) and verify zero lint warnings, zero errors, and clean bundle generation.
