# Spec Delta — product-catalog

## Purpose

The `product-catalog` capability provides the responsive Product List Page (PLP) interface, displaying mobile devices in a responsive grid (maximum 4 items per row), real-time search filtering by brand and model, image error fallbacks, skeleton loading states, empty search state feedback, and error recovery.

## ADDED Requirements

### Requirement: Responsive Product Catalog Grid Layout

The Product List Page MUST render the device catalog in a responsive grid displaying at most 4 items per row on desktop viewports. On smaller screens, the layout MUST adapt to fewer columns without horizontal overflow. Each card MUST display the product image, brand, model, and formatted price, and act as an accessible link navigating to its product details view.

#### Scenario: Full catalog displayed with max 4 columns on desktop
- **GIVEN** the device catalog contains products
- **WHEN** the user visits the Product List Page ("/") on a desktop viewport (> 1024px)
- **THEN** all products are rendered in item cards
- **AND** the grid displays at most 4 items per row
- **AND** each card displays the device image, brand, model, and formatted price

#### Scenario: Responsive column adaptation on smaller screens
- **GIVEN** the user views the Product List Page on mobile or tablet resolutions
- **WHEN** the viewport width decreases below 1024px
- **THEN** the grid layout adjusts to 3 columns on tablet, 2 on small tablet, and 1 column on mobile
- **AND** no horizontal scrollbars or clipped cards are introduced

#### Scenario: Product selection navigates to Product Details Page
- **GIVEN** an item card for a device with identifier "ZmGrkLRPXOTpxsU4jjAcv" is rendered
- **WHEN** the user clicks or activates the card
- **THEN** the application navigates to "/product/ZmGrkLRPXOTpxsU4jjAcv"

#### Scenario: Broken image displays placeholder
- **GIVEN** a device item possesses an invalid or unreachable image URL
- **WHEN** the card image fails to load in the browser
- **THEN** an accessible visual placeholder is displayed without breaking card dimensions

---

### Requirement: Real-Time Brand and Model Search Filtering

The application MUST provide a search input above the product catalog allowing real-time, case-insensitive filtering by product brand or model name. As the user enters text, the displayed items MUST update immediately to show only matching devices. Trimming MUST ignore leading and trailing whitespace. Clearing the search input MUST immediately restore the complete catalog.

#### Scenario: Real-time search filtering matching brand or model
- **GIVEN** the catalog contains devices across multiple brands (e.g. "Acer", "Alcatel", "Apple")
- **WHEN** the user types "apple" into the search bar
- **THEN** the grid updates immediately to show only devices whose brand or model contains "apple"
- **AND** matching is performed case-insensitively

#### Scenario: Search filtering handles whitespace and special characters
- **GIVEN** the user enters a search query with leading or trailing whitespace (e.g. "  Iconia  ")
- **WHEN** the filter evaluates
- **THEN** the query is trimmed
- **AND** devices matching "Iconia" are displayed

#### Scenario: Clearing search restores full catalog
- **GIVEN** the user has filtered the catalog with an active search query
- **WHEN** the user clears or deletes the text from the search input
- **THEN** the filter is cleared
- **AND** the full catalog of devices is immediately displayed

---

### Requirement: Search Empty State Feedback

When a search query matches zero devices in the catalog, the application MUST hide the product grid and display a clear empty state message informing the user that no products were found. The empty state MUST provide an interactive action to clear the search query and restore the full catalog.

#### Scenario: Zero search matches display clear empty state message
- **GIVEN** the user is on the Product List Page with an active catalog
- **WHEN** the user enters a search term "NonExistentModel999" that matches no devices
- **THEN** the item grid is hidden
- **AND** an empty state message is displayed indicating no devices match the query
- **AND** an action is provided to clear the search input

#### Scenario: Clearing from empty state restores catalog
- **GIVEN** the empty state is displayed due to an unmatched query
- **WHEN** the user activates the clear search action
- **THEN** the search input is reset to empty
- **AND** the full catalog grid is restored

---

### Requirement: Catalog Loading and Error Recovery States

While the product catalog is being retrieved from the service, the Product List Page MUST display skeleton loading placeholders to maintain visual layout stability. If the catalog fetch fails due to a network or server error, the page MUST display an informative error notification with an interactive action allowing the user to retry the operation.

#### Scenario: Visual skeleton placeholders during catalog fetch
- **GIVEN** the catalog is being fetched from the API and is not yet in cache
- **WHEN** the Product List Page mounts
- **THEN** a responsive grid of skeleton placeholder cards is displayed until data arrives

#### Scenario: Catalog fetch failure displays error with retry CTA
- **GIVEN** the catalog request fails with a network or server error and no cached data exists
- **WHEN** the Product List Page mounts
- **THEN** an error message is displayed informing the user of the failure
- **AND** a "Retry" button is provided allowing the user to re-attempt fetching the catalog
