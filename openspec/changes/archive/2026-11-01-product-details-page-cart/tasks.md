# Tasks — Product Details Page (PDP) and Cart Mutation

## 1. ProductImage Component

- [x] 1.1 Implement `ProductImage.jsx` in `src/components/details/ProductImage/ProductImage.jsx` displaying the device image with aspect ratio container, zoom hover effect, and SVG placeholder on error. Verify by checking component exports.
- [x] 1.2 Implement `ProductImage.module.css` with responsive container dimensions, borders, and image centering matching `PDP.png`. Verify styles through CSS class binding.
- [x] 1.3 Implement unit tests in `src/components/details/ProductImage/ProductImage.test.jsx` covering image rendering, alt attributes, and error fallback state. Verify with `npx vitest run src/components/details/ProductImage/ProductImage.test.jsx`.

## 2. ProductDescription Component

- [x] 2.1 Implement attribute formatter utilities in `src/utils/attributeFormatters.js` to normalize camera arrays, typos (`dimentions`, `secondaryCmera`), and null values (`-`). Verify utility exports.
- [x] 2.2 Implement `ProductDescription.jsx` and `ProductDescription.module.css` in `src/components/details/ProductDescription/` rendering Brand, Model, Price, and technical specifications table. Verify component rendering and CSS classes.
- [x] 2.3 Implement unit tests in `src/components/details/ProductDescription/ProductDescription.test.jsx` covering all 11 technical attributes, null fallbacks, and array formatting. Verify with `npx vitest run src/components/details/ProductDescription/ProductDescription.test.jsx`.

## 3. ProductActions Component

- [x] 3.1 Implement `ProductActions.jsx` in `src/components/details/ProductActions/ProductActions.jsx` managing Storage and Color selectors with mandatory default pre-selection and Add CTA. Verify component structure.
- [x] 3.2 Implement `ProductActions.module.css` with responsive option pill buttons, active state highlights, in-flight button styles, and error banner. Verify CSS classes.
- [x] 3.3 Implement unit tests in `src/components/details/ProductActions/ProductActions.test.jsx` covering default pre-selections (including single-option cases), option switching, in-flight button disable, and error alerts. Verify with `npx vitest run src/components/details/ProductActions/ProductActions.test.jsx`.

## 4. ProductDetailsSkeleton Component

- [x] 4.1 Implement `ProductDetailsSkeleton.jsx` and `ProductDetailsSkeleton.module.css` in `src/components/details/ProductDetailsSkeleton/` providing two-column shimmer layout. Verify component structure and CSS classes.
- [x] 4.2 Implement unit tests in `src/components/details/ProductDetailsSkeleton/ProductDetailsSkeleton.test.jsx` verifying placeholder structure and accessibility attributes. Verify with `npx vitest run src/components/details/ProductDetailsSkeleton/ProductDetailsSkeleton.test.jsx`.

## 5. ProductDetails Page Integration

- [x] 5.1 Update `src/pages/ProductDetails/ProductDetails.jsx` and `ProductDetails.module.css` integrating `productService.getProductById(id)`, `ProductImage`, `ProductDescription`, `ProductActions`, and back navigation link. Verify component rendering.
- [x] 5.2 Implement error and 404 not-found recovery views with an interactive action to return to the catalog (`/`). Verify state rendering in unit tests.
- [x] 5.3 Implement comprehensive test suite in `src/pages/ProductDetails/ProductDetails.test.jsx` covering skeleton loading, full details rendering, selector pre-selection, cart mutation trigger, in-flight disable state, and 404 recovery. Verify with `npx vitest run src/pages/ProductDetails/ProductDetails.test.jsx`.

## 6. Documentation & Topology Updates

- [x] 6.1 Create `docs/flows/product-details-cart.md` documenting PDP layout, option selectors, cart mutation sequence, and counter synchronization. Verify file exists and markdown is valid.
- [x] 6.2 Update `docs/topology.md` to document the new `src/components/details/` components and integration with `CartContext` and `productService`. Verify documentation accuracy.

## 7. Integration Quality Gate

- [x] 7.1 Run full Vitest test suite across all application components and verify all tests pass with zero failures (`npm test`).
- [x] 7.2 Run ESLint checks and verify zero errors and zero warnings (`npm run lint`).
- [x] 7.3 Run production compilation and verify bundle builds successfully with zero errors (`npm run build`).
