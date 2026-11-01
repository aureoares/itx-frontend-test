# Flow: Catalog Browsing & Real-Time Search

This document describes the user journey, sequence flows, and caching interactions for the **Product List Page (PLP)** (`/`).

---

## 1. Catalog Initial Load & Caching Lifecycle

When a user visits the storefront (`/`), the application attempts to load the device catalog from client storage first. If a valid cache envelope exists (age < 1 hour), the catalog renders instantly with zero network round-trips. Otherwise, it retrieves fresh data from the remote API while displaying 8 animated skeleton cards.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant PLP as ProductList Page
    participant Svc as productService
    participant Storage as storageService (localStorage)
    participant API as apiClient / Remote API

    User->>PLP: Mounts "/" (Catalog View)
    PLP->>PLP: Render 8 Skeleton Cards
    PLP->>Svc: getProducts()
    Svc->>Storage: getEnvelope("itx_cache_products")

    alt Valid Cache (< 1 Hour Old)
        Storage-->>Svc: CacheEnvelope { timestamp, data }
        Svc-->>PLP: Return cached ProductItem[]
    else Expired or Missing Cache
        Storage-->>Svc: null / expired
        Svc->>API: getProducts() (GET /api/product)
        API-->>Svc: Fresh ProductItem[]
        Svc->>Storage: setEnvelope("itx_cache_products", data)
        Svc-->>PLP: Return fresh ProductItem[]
    end

    PLP->>PLP: Render ProductGrid (max 4 cols)
```

---

## 2. Real-Time Search Filtering Flow

As the user enters text into the search input positioned on the top right, `ProductList` filters the in-memory array synchronously with `useMemo`.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Search as SearchBar
    participant PLP as ProductList Page
    participant Grid as ProductGrid

    User->>Search: Types query "apple"
    Search->>PLP: onChange("apple")
    PLP->>PLP: Normalize query: "apple".trim().toLowerCase()
    PLP->>PLP: Substring filter: brand.includes("apple") || model.includes("apple")

    alt Matches Found (Count > 0)
        PLP->>Grid: Render filtered ProductCard[]
        PLP->>Search: Update counter: "N items"
    else Zero Matches
        PLP->>PLP: Render EmptyState ("No devices found")
        User->>PLP: Clicks "Clear search"
        PLP->>Search: Reset query to ""
        PLP->>Grid: Restore full catalog
    end
```

---

## 3. Error Recovery & Retry Flow

If the initial network request fails and no valid cache is available:
1. `ProductList` enters the error state, hiding the skeletons.
2. An accessible error banner (`role="alert"`) displays the error message and an interactive **Retry** button.
3. Clicking **Retry** invokes `productService.getProducts({ forceRefresh: true })`, forcing a fresh network request and restoring the catalog on success.

---

## 4. Responsive Breakpoints

Adhering to the visual specification in `workflow/backlog/raw/PLP.png`:

| Viewport | Width | Columns | Gap | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Desktop** | `> 1024px` | **4** | `24px` | Strict requirement: at most 4 items per row |
| **Tablet** | `769px – 1024px` | **3** | `16px` | Smooth reflow |
| **Small Tablet** | `541px – 768px` | **2** | `16px` | Compact grid |
| **Mobile** | `≤ 540px` | **1** | `16px` | Full-width single column cards |
