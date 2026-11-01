# Proposal — Product Details Page (PDP) and Cart Mutation

## Why

The Product Details Page (PDP) at `/product/:id` is the second of the two mandatory views in the application. While the storefront catalog (`ITX-003`) allows browsing and filtering devices, users currently cannot view comprehensive technical specifications, configure device storage and color variants, or add devices to their shopping cart.

Implementing the PDP completes the core customer purchase flow defined in the technical specification (`workflow/backlog/raw/ITX-FrontEndTest1_en.md`), providing the responsive two-column layout (`IMAGE`, `DESCRIPTION`, `ACTIONS`) matching `workflow/backlog/raw/PDP.png`, and connecting the cart mutation action to the remote API (`POST /api/cart`) and persistent header cart counter.

Originating Backlog Item: [workflow/backlog/items/ITX-004-product-details-page-cart.md](../../../workflow/backlog/items/ITX-004-product-details-page-cart.md)

## What Changes

- Replace the placeholder `ProductDetails` page (`src/pages/ProductDetails/ProductDetails.jsx`) with a fully realized responsive two-column view integrating with `productService.getProductById(id)`.
- Implement `ProductImage` (`src/components/details/ProductImage/ProductImage.jsx`) rendering the primary device image with an accessible fallback placeholder on image load failure.
- Implement `ProductDescription` (`src/components/details/ProductDescription/ProductDescription.jsx`) presenting core product identity (Brand, Model, formatted Price) and a structured specifications table mapping all required attributes (CPU, RAM, Operating System, Screen resolution, Battery, Cameras, Dimensions, Weight) with null-safe fallbacks (`-`).
- Implement `ProductActions` (`src/components/details/ProductActions/ProductActions.jsx`) providing:
  - Storage variant selector and Color variant selector, visibly rendered and pre-selected by default even if only 1 option is available.
  - Interactive "Add" button that triggers cart addition (`cartService.addDeviceToCart({ id, colorCode, storageCode })`).
  - In-flight disabled button state preventing duplicate submissions while the mutation request is pending.
  - Error notification banner on mutation failure, re-enabling the button for user retry.
- Implement loading skeleton placeholders matching the two-column PDP layout during detail retrieval.
- Implement not-found / error recovery view when a device ID is invalid or cannot be fetched, providing an explicit link returning to the catalog (`/`).
- Document product configuration, cart mutation flow, and header synchronization in `docs/flows/product-details-cart.md` and update `docs/topology.md`.

### Non-Goals (Out of Scope)
- Checkout, shipping address collection, or order payment flows (out of scope per test specification).
- Quantity counter or batch device additions (the specification defines single device addition per action).
- Cart drawer or cart management modal (spec specifies cart counter in header only).

## Capabilities

### New Capabilities
- `product-details`: Responsive Product Details Page (PDP) interface, two-column layout (`IMAGE`, `DESCRIPTION`, `ACTIONS`), technical specifications mapping with null-safety, Storage and Color selectors with mandatory default pre-selection, Add-to-cart mutation handling with in-flight disable state, error feedback, loading skeletons, and not-found recovery.

### Modified Capabilities
*(None. `app-shell` layout and `api-cache` services persist intact)*

## Impact

- **Pages**: `src/pages/ProductDetails/ProductDetails.jsx` and `ProductDetails.module.css`.
- **Components**: `src/components/details/ProductImage/`, `src/components/details/ProductDescription/`, `src/components/details/ProductActions/`, and `src/components/details/ProductDetailsSkeleton/`.
- **Context & Services**: Interacts with `CartContext` (`useCart`) and `productService.getProductById(id)`.
- **Documentation**: New `docs/flows/product-details-cart.md` and updated `docs/topology.md`.
- **Testing**: Unit tests for selectors, specs mapping, cart mutation trigger, error handling, loading states, and integration tests for route parameters and cart counter synchronization.
