# Front-End Test

## Summary

This test consists of creating a mini-application for purchasing mobile devices.

- The application will have only two views:
  1. Main view - Product list
  2. Product details
- The implementation of the designs is open to choice, but it must follow the structure defined in the screenshots. The level of detail of the proposal will be positively evaluated.
- The use of React/Preact is required for application development and may be complemented with other JS libraries if deemed appropriate.
- The use of JS with ES6 is allowed, and preferably the test should not be done with TypeScript.
- A boilerplate template may be used to create the project structure.
- The application will be an SPA, where view routing will be added in client-side code, without being an MPA or using SSR.
- The project must contain the following scripts:
  1. START - Development mode
  2. BUILD - Compilation for production mode
  3. TEST - Run tests
  4. LINT - Code checking
- The project must be submitted in an open-source repository (GitHub, GitLab, Bitbucket), with the solution to the problem.
- A README document must be included in the repository (preferably in the first commit), which will include instructions on how to run the project, as well as explanatory notes or necessary additional information.

## Description of the views

### PLP - Product List Page

- All items returned by the API request will be displayed.
- It will allow filtering of the content based on the search criteria entered by the user.
- When selecting a product, it must navigate to its details.
- A maximum of four items per row will be displayed, and it will be responsive according to resolution.

[PDP.png](./PDP.png)

### PDP - Product Details Page

- The page will be divided into two columns:
  - In the first one, the product image component will be displayed.
  - In the second one, the product details and actions will be displayed.
- It must display a link to navigate back to the product list.

[PLP.png](./PLP.png)

## Description of the components

### Header (HEADER)

- The title or icon of the application will act as a link to the main view.
- Breadcrumbs will be displayed with the current page and navigation links.
- On the right side of the header, the number of items added to the cart will be displayed.

### Search bar (SEARCH)

- An input will be displayed to enter a text string.
- The user will be able to filter products by matching against brand and model.
- Filtering will be in real time.

### List item (ITEM)

Information to display:

- Image
- Brand
- Model
- Price

### Product image (IMAGE)

- The product image will be displayed.

### Product description (DESCRIPTION)

At least the following attributes will be displayed:

- Brand
- Model
- Price
- CPU
- RAM
- Operating System
- Screen resolution
- Battery
- Cameras
- Dimensions
- Weight

### Product actions (ACTIONS)

- Two selectors will be displayed:
  - Storage
  - Colors
- Even if there is only one option, the selector will be displayed and selected by default.
- An Add button will be displayed to add the product to the cart.
- The add request must send:

```json
{
  "id": 1,
  "colorCode": 1,
  "storageCode": 2
}
```

- The response will return the number of products in the cart.
- This value must be persisted and displayed in the header of any view.

## Resources

### API Integration

Base domain:

`https://itx-frontend-test.onrender.com/`

#### Get product list

**Path**

```http
GET /api/product
```

**Response**

```json
[
  {
    "id": 0001
  },
  {
    "id": 0002
  }
]
```

#### Get product details

**Path**

```http
GET /api/product/:id
```

**Response**

```json
{
  "id": 0001
}
```

#### Add product to cart

**Path**

```http
POST /api/cart
```

**Body**

```json
{
  "id": 0001,
  "colorCode": 1,
  "storageCode": 2
}
```

**Response**

```json
{
  "count": 1
}
```

### Data persistence

- Information will be stored each time it is requested to the API.
- The information will have an expiration time of 1 hour.
- Once expired, it must be revalidated.
- Any client-side storage method may be used (browser or memory).
