# Domain Models & Data Contracts

This document defines the canonical domain models, persistence schemas, and ubiquitous language for the **ITX Mobile Device Store** application.

---

## 1. Domain Entities & API Payloads

### 1.1 `ProductItem` (Catalog Summary)
Returned as an array by `GET /api/product`:

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Unique product identifier | `"ZmGrkLRPXOTpxsU4jjAcv"` |
| `brand` | `string` | Manufacturer brand name | `"Acer"` |
| `model` | `string` | Device model designation | `"Iconia Talk S"` |
| `price` | `string` | Retail price in currency units | `"170"` |
| `imgUrl` | `string` | Full image asset URL | `"https://..."` |

---

### 1.2 `ProductDetail` (Complete Specifications)
Returned by `GET /api/product/:id`:

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier matching catalog item |
| `brand`, `model`, `price`, `imgUrl` | `string` | Core product details |
| `cpu`, `ram`, `os` | `string` | Processing architecture and operating system |
| `displayResolution`, `displaySize` | `string` | Screen dimensions and pixel resolution |
| `battery`, `weight`, `dimentions` | `string` | Physical specifications (Note: API spelling `dimentions`) |
| `primaryCamera`, `secondaryCmera` | `string \| Array` | Camera capabilities (Note: API spelling `secondaryCmera`) |
| `options.colors` | `Array<{ code: number, name: string }>` | Available device color variants |
| `options.storages` | `Array<{ code: number, name: string }>` | Available internal storage variants |

---

### 1.3 `CartMutationPayload` (Cart Request)
Dispatched in request body to `POST /api/cart`:

```json
{
  "id": "ZmGrkLRPXOTpxsU4jjAcv",
  "colorCode": 1000,
  "storageCode": 2000
}
```

- **Remote API Response**: `{ "count": 1 }` (Stateless response returned upon every successful addition).

---

## 2. Persistence & Caching Models

### 2.1 `CacheEnvelope`
Envelopes stored in client storage (`localStorage` with in-memory fallback) for 1-hour response caching:

```typescript
interface CacheEnvelope<T> {
  timestamp: number; // Unix epoch in milliseconds (Date.now())
  data: T;          // Raw payload received from remote API
}
```

- **Validation Rule**:
  $$\text{Cache Valid} \iff 0 \le (\text{Date.now()} - \text{timestamp}) < 3,600,000 \text{ ms}$$
- **Revalidation**: When the elapsed age reaches or exceeds 1 hour (3,600,000 ms), the cache entry is marked expired and the remote API is queried to refresh data and timestamp.

---

### 2.2 `CartState`
Reactive client-side shopping cart state managed via `CartContext`:

```typescript
interface CartState {
  cartCount: number;             // Total accumulated devices added to the cart
  isMutating: boolean;           // True while an async POST /api/cart operation is in flight
  mutationError: Error | null;   // Error details if the last mutation failed
}
```

- **Client-Side Accumulation**: Because `POST /api/cart` statelessly returns `{ count: 1 }`, the client persists the running total in `localStorage` under key `itx_cart_count` and increments the count upon each successful mutation.

---

### 2.3 `ApiError`
Normalized error model thrown by `apiClient`:

```typescript
class ApiError extends Error {
  name: "ApiError";
  status: number;      // HTTP status code (e.g. 404, 500, 408 for timeout, 0 for network failure)
  message: string;     // Human-readable diagnostic message
  data: any | null;    // Parsed response body or internal cause
}
```

---

## 3. Storage Key Namespaces

All keys persisted by `storageService` use the standardized `itx_` prefix to prevent collision:

| Storage Key | Content Type | Expiration | Purpose |
| :--- | :--- | :--- | :--- |
| `itx_cache_products` | `CacheEnvelope<ProductItem[]>` | 1 Hour (3,600,000 ms) | Cached device catalog list |
| `itx_cache_product_<id>` | `CacheEnvelope<ProductDetail>` | 1 Hour (3,600,000 ms) | Cached specifications for device `<id>` |
| `itx_cart_count` | `number` | Persistent | Accumulated total device count |
