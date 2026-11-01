# Spec Delta — api-cache

## Purpose

The `api-cache` capability provides centralized remote HTTP communication with the device catalog API, client-side response caching with an exact 1-hour expiration Time-to-Live (TTL), automatic cache revalidation, corrupted storage recovery, in-memory fallback, and persistent shopping cart count accumulation.

## ADDED Requirements

### Requirement: Remote API Communication and Error Diagnostics

The application MUST provide a centralized client for executing HTTP operations against the external product API (`https://itx-frontend-test.onrender.com/`), supporting catalog retrieval (`GET /api/product`), product detail retrieval (`GET /api/product/:id`), and cart mutations (`POST /api/cart`). The client MUST detect network timeouts, non-2xx HTTP responses, and malformed server payloads, propagating diagnostic error details without unhandled application crashes.

#### Scenario: Successful product catalog retrieval
- **GIVEN** the remote API is operational
- **WHEN** a request is issued for the product catalog
- **THEN** the client receives the array of product records with HTTP status 200
- **AND** returns the parsed catalog data to the caller

#### Scenario: Remote API returns HTTP error
- **GIVEN** the remote API encounters an internal failure (e.g. HTTP 500) or network timeout
- **WHEN** a request is issued for a product or the catalog
- **THEN** the client catches the HTTP error
- **AND** throws a structured error containing the HTTP status and diagnostic message
- **AND** the application handles the error without crashing

#### Scenario: Product not found by identifier
- **GIVEN** a request is issued for a product identifier that does not exist on the remote server
- **WHEN** the remote API responds with HTTP 404
- **THEN** the client propagates a descriptive not-found error to the caller

---

### Requirement: 1-Hour TTL Client-Side Response Caching

All successful product API responses MUST be cached locally with a timestamped envelope. Subsequent requests for the same resource within 1 hour (3,600,000 ms) MUST be served directly from cache without network traffic. When an entry reaches or exceeds 1 hour, the application MUST revalidate against the remote API, refreshing the cached payload and timestamp.

#### Scenario: Fresh request stores data with 1-hour expiration
- **GIVEN** no valid cached entry exists for "/api/product"
- **WHEN** the product catalog is requested
- **THEN** data is fetched from the remote API
- **AND** stored locally inside an envelope containing the current timestamp and a 1-hour TTL

#### Scenario: Subsequent request within 1 hour serves from cache
- **GIVEN** valid cached data for "/api/product" was stored 30 minutes ago
- **WHEN** the product catalog is requested
- **THEN** data is served directly from the local cache
- **AND** no network request is sent to the remote API

#### Scenario: Expired cache entry triggers revalidation
- **GIVEN** cached data for "/api/product" was stored 65 minutes ago (exceeding the 1-hour TTL)
- **WHEN** the product catalog is requested
- **THEN** the cache entry is marked as expired
- **AND** a fresh network request is dispatched to the remote API
- **AND** the stored cache entry is updated with fresh data and a new timestamp

---

### Requirement: Resilient Storage Recovery and In-Memory Fallback

The storage service MUST handle corrupted data and storage exceptions gracefully. If a cached entry contains malformed JSON, the service MUST remove the corrupted key and retrieve fresh data from the API. If browser storage is unavailable or throws a quota exception, the service MUST seamlessly fall back to an in-memory store for the active session without failing requests.

#### Scenario: Corrupted cache entry recovery
- **GIVEN** storage contains corrupted or malformed JSON under a cache key
- **WHEN** the application requests the cached resource
- **THEN** the parsing exception is handled safely without throwing an unhandled exception
- **AND** the corrupted key is removed from storage
- **AND** fresh data is retrieved from the remote API

#### Scenario: Storage quota exceeded or storage disabled
- **GIVEN** browser local storage throws a quota exceeded error or is completely unavailable
- **WHEN** a cache write or cart persistence operation occurs
- **THEN** the operation gracefully falls back to an in-memory storage map
- **AND** reads and writes proceed successfully for the lifetime of the active browser session

---

### Requirement: Shopping Cart Accumulation and Persistence

Because the remote cart endpoint (`POST /api/cart`) behaves statelessly and returns a fixed count of 1 per operation, the application MUST maintain and accumulate the running total cart item count on the client. Every successful cart mutation MUST increment the client's total accumulated count and persist it in storage. The accumulated cart count MUST persist across page navigations, browser refreshes, and new browser tabs.

#### Scenario: Cart mutation accumulates and persists item count
- **GIVEN** the current accumulated cart count is 1
- **WHEN** a cart addition request with product ID, color code, and storage code is confirmed by the remote API
- **THEN** the accumulated cart count is incremented to 2
- **AND** the updated count of 2 is persisted to client storage
- **AND** the updated count is immediately reflected in the cart counter

#### Scenario: Cart count restores across browser reloads
- **GIVEN** the user has accumulated a cart count of 3 in a previous session
- **WHEN** the user reloads the browser or opens the application in a new session
- **THEN** the stored cart count of 3 is restored from storage
- **AND** the Header cart badge displays "3" upon initial mount
