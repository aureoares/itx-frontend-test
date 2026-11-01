# product-details Specification

## Purpose

The `product-details` capability provides the responsive Product Details Page (PDP) interface at `/product/:id`, featuring a two-column layout with product image, technical specifications mapping, storage and color variant selectors with default pre-selection, and cart addition mutations.

## Requirements

### Requirement: Responsive Two-Column Product Details Layout

The Product Details Page MUST render in a responsive two-column layout on desktop viewports. Column 1 MUST display the product image with fallback support, and Column 2 MUST display product details and actions. On mobile viewports, the layout MUST adapt to a single stacked column without horizontal clipping. A navigation link MUST be provided to return to the catalog.

#### Scenario: Desktop two-column rendering
- **GIVEN** the user navigates to "/product/ZmGrkLRPXOTpxsU4jjAcv" on a desktop viewport (> 768px)
- **WHEN** the device details load
- **THEN** the page displays a two-column grid
- **AND** Column 1 displays the device image component
- **AND** Column 2 displays the device details, specs, and action selectors

#### Scenario: Mobile stacked single-column adaptation
- **GIVEN** the user views the Product Details Page on a mobile viewport (<= 768px)
- **WHEN** the page renders
- **THEN** the layout reflows into a single vertical column with the image on top
- **AND** no horizontal scrolling or clipped content is introduced

#### Scenario: Navigation link returns to catalog
- **GIVEN** the user is viewing the Product Details Page
- **WHEN** the user activates the back link or breadcrumb home link
- **THEN** the application navigates back to the Product List Page ("/")

---

### Requirement: Technical Specifications Display and Null-Safety

The application MUST display technical specifications for the selected device, including Brand, Model, Price, CPU, RAM, Operating System, Screen resolution, Battery, Cameras, Dimensions, and Weight. Missing, null, or empty values MUST render a placeholder dash ("-") without throwing errors or breaking layout. If the image fails to load, a placeholder MUST be displayed.

#### Scenario: Full specification attributes displayed
- **GIVEN** a device record with complete technical attributes is retrieved
- **WHEN** the specifications list renders
- **THEN** Brand, Model, Price, CPU, RAM, OS, Screen resolution, Battery, Cameras, Dimensions, and Weight are all visible

#### Scenario: Null or missing attributes render fallback dash
- **GIVEN** a device record has null or empty values for secondary camera or weight
- **WHEN** the specifications table renders
- **THEN** each missing attribute displays an informative dash ("-")

#### Scenario: Broken product image displays accessible placeholder
- **GIVEN** the device detail object contains an invalid or broken image URL
- **WHEN** the image element encounters a load error
- **THEN** an accessible placeholder is displayed without collapsing the image container

---

### Requirement: Storage and Color Variant Selectors with Default Pre-Selection

The Product Details Page MUST visibly render selectors for device Storage and Color variants. Even if only one option is available, the selector MUST be displayed and pre-selected by default. When multiple options exist, the first available option MUST be pre-selected. Changing a selection MUST update the active configuration for cart addition.

#### Scenario: Single option selector displayed and selected by default
- **GIVEN** a device has only 1 color option ("Black", code 1000) and 1 storage option ("32 GB", code 2000)
- **WHEN** the Product Details Page renders
- **THEN** both the Color and Storage selectors are visibly rendered
- **AND** "Black" is selected by default
- **AND** "32 GB" is selected by default

#### Scenario: Multiple options pre-select the first option
- **GIVEN** a device has 2 storage options ("16 GB", code 2000; "32 GB", code 2001)
- **WHEN** the Product Details Page renders
- **THEN** the first storage option ("16 GB") is selected by default

#### Scenario: User changes active storage or color variant
- **GIVEN** the user is on the Product Details Page with storage options "16 GB" and "32 GB"
- **WHEN** the user selects the "32 GB" option
- **THEN** the selector reflects "32 GB" as the active selection
- **AND** subsequent cart mutations submit storageCode 2001

---

### Requirement: Add-to-Cart Mutation and Counter Synchronization

The application MUST provide an "Add" action button that dispatches a cart addition request to the remote API (`POST /api/cart`) with the configured device identifier, color code, and storage code. Upon success, the global cart counter MUST increment and persist. While the request is in flight, the button MUST be disabled to prevent duplicate submissions.

#### Scenario: Successful device addition increments and persists cart count
- **GIVEN** the user has selected Color code 1000 and Storage code 2000 for device "ZmGrkLRPXOTpxsU4jjAcv"
- **AND** the current cart count is 0
- **WHEN** the user clicks the "Add" button
- **THEN** a POST request is sent to "/api/cart" with body `{"id":"ZmGrkLRPXOTpxsU4jjAcv","colorCode":1000,"storageCode":2000}`
- **AND** upon success the header cart count updates to 1
- **AND** the count persists across page reloads

#### Scenario: Add button disabled during in-flight submission
- **GIVEN** the user clicks the "Add" button
- **WHEN** the cart mutation request is in flight
- **THEN** the button enters a disabled state
- **AND** duplicate click events are ignored until the request completes

#### Scenario: Cart addition API failure displays error notification
- **GIVEN** the user clicks the "Add" button
- **WHEN** the POST request to "/api/cart" fails due to a network or server error
- **THEN** an error alert is displayed to the user
- **AND** the global cart count remains unchanged
- **AND** the "Add" button is re-enabled to allow another attempt

---

### Requirement: Product Details Loading and Not-Found States

While device details are being retrieved from the service, the page MUST display a skeleton loading placeholder matching the two-column layout. If the requested product identifier is not found (404) or fails to load, the page MUST display an informative error state with a navigation action to return to the catalog.

#### Scenario: Skeleton placeholders displayed during detail fetch
- **GIVEN** product details are being requested from the API and are not cached
- **WHEN** the Product Details Page mounts
- **THEN** two-column skeleton placeholders are displayed until data arrives

#### Scenario: Invalid product identifier displays not-found error with return action
- **GIVEN** the user navigates to "/product/invalid-id-999"
- **WHEN** the API responds with an HTTP 404 error
- **THEN** an error message is displayed informing the user the device was not found
- **AND** an action is provided to return to the Product List Page ("/")
