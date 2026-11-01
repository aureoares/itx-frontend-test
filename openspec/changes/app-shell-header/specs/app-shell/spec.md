# Spec Delta — app-shell

## Purpose

The `app-shell` capability defines the foundational client-side layout, responsive view landmarks, client-side routing, and the global sticky header with breadcrumb navigation and live cart counter badge.

## ADDED Requirements

### Requirement: Application Shell and Layout Landmarks

The application MUST provide a consistent root layout structure containing a persistent top header and a main content area. The main container MUST use semantic HTML5 `<main>` elements and adapt responsively across viewport resolutions without horizontal scrollbars.

#### Scenario: Layout structure rendering
- **GIVEN** the application mounts in a web browser
- **WHEN** the root layout is rendered
- **THEN** a `<header>` element is present at the top of the page
- **AND** a `<main>` container holds the active view content

#### Scenario: Mobile viewport responsiveness
- **GIVEN** a viewport width of 375px (mobile resolution)
- **WHEN** the application layout renders
- **THEN** the layout elements adjust vertically without horizontal clipping or overflow

---

### Requirement: Client-Side Routing and Route Fallback

The application MUST implement client-side routing for all view transitions, strictly avoiding full page reloads or server-side page requests. When an unrecognized or invalid URL path is accessed, the router MUST display a user-friendly 404 Not Found view with an explicit navigation link returning to the Product List Page (`/`).

#### Scenario: Seamless route transition
- **GIVEN** the user is on the Product List Page ("/")
- **WHEN** a navigation action to a product route is triggered
- **THEN** the URL updates and the target view renders without a full browser page reload

#### Scenario: Unrecognized route renders 404 fallback
- **GIVEN** the user navigates directly to an unrecognized route such as "/invalid-route-path"
- **WHEN** the router matches the URL
- **THEN** a 404 Not Found view is displayed informing the user the page does not exist
- **AND** a clickable link or button is provided navigating back to "/"

---

### Requirement: Global Sticky Header with Logo Navigation

The application MUST display a sticky Header at the top of every view. The Header MUST include an application title or logo that acts as a navigational link returning the user to the Product List Page (`/`).

#### Scenario: Logo navigation to home view
- **GIVEN** the user is viewing any subpage or error view
- **WHEN** the user clicks the application logo or title in the Header
- **THEN** the application navigates immediately to the Product List Page ("/")

---

### Requirement: Header Breadcrumb Navigation

The Header MUST render a breadcrumb navigation trail displaying the user's current location within the application hierarchy. When viewing child routes, parent segments MUST be clickable links that navigate to the corresponding parent view.

#### Scenario: Breadcrumb on child view
- **GIVEN** the user is on the Product Details Page for a specific device
- **WHEN** the Header breadcrumb trail renders
- **THEN** it displays "Home" as a clickable link followed by the current page indicator
- **AND** clicking "Home" navigates the user back to the Product List Page ("/")

#### Scenario: Breadcrumb on home view
- **GIVEN** the user is on the Product List Page ("/")
- **WHEN** the Header breadcrumb trail renders
- **THEN** it displays "Home" as the current active location without a redundant self-link

---

### Requirement: Header Cart Item Counter Badge

The Header MUST feature a cart indicator on the right side displaying the current number of items in the user's shopping cart. The counter MUST visibly display "0" when the cart is empty and update in real time when items are added.

#### Scenario: Cart counter displays active item count
- **GIVEN** the user has 3 items in their cart
- **WHEN** any view renders
- **THEN** the cart indicator in the Header displays the numeric value "3"
- **AND** includes an accessible text label indicating 3 items in the cart

#### Scenario: Cart counter when cart is empty
- **GIVEN** the user has 0 items in their cart
- **WHEN** any view renders
- **THEN** the cart indicator visibly displays "0"
