# ByteBite
[![ByteBite CI](https://github.com/shreyas457/SE_G25/actions/workflows/proj2-ci.yml/badge.svg)](https://github.com/shreyas457/SE_G25/actions/workflows/proj2-ci.yml)

ByteBite is a single-restaurant food-ordering and food-redistribution system built by **NCSU Team G25**.

The project has three main capabilities:

1. Customers place orders from a single restaurant, track status, and pay online or via cash-on-delivery.
2. When a customer cancels an order, the restaurant can either:
   - expose the order to other customers so they can claim it, or  
   - redirect the order to a partner shelter as a donation.
3. Customers can view selected menu items using a 3D model carousel to obtain a richer view of each dish.

The goal is to reduce food waste while maintaining a standard online ordering experience.

---

## System Overview

The system consists of three applications:

- `backend/`  
  Node.js + Express + MongoDB API exposing authentication, menu, cart, order, shelter, and reroute (donation history) endpoints.

- `frontend/`  
  React + Vite customer-facing web application for browsing the menu, placing orders, claiming redistributed orders, and viewing 3D models of dishes (via `three`, `@react-three/fiber`, and `@react-three/drei`).

- `admin/`  
  React + Vite restaurant admin dashboard for managing menu items, monitoring orders, updating statuses, and assigning cancelled orders to partner shelters.

The backend exposes REST endpoints under `/api/*` and uses JSON Web Tokens (JWT) for authenticated operations.

---

## Core Functionalities

### 1. Customer Ordering

- Customers register and log in.
- Customers browse the menu, add items to their cart, and place orders.
- Orders are stored in MongoDB with a finite-state status model:
  - `Food Processing`
  - `Out for delivery`
  - `Delivered`
  - `Redistribute`
  - `Cancelled`
  - `Claimed`
- Payment can be completed either by:
  - Stripe-based flow (`/api/order/place` + `/api/order/verify`), or
  - Cash-on-delivery (`/api/order/placecod`).

### 2. Cancellation and Redistribution Queue

When a customer cancels an order:

- The backend validates that the cancelling user is either the original owner or (if already claimed) the current owner.
- If the status allows cancellation (for example, `Food Processing` or `Out for delivery`), the status is set to `Redistribute`.
- A queue notification is emitted via Socket.IO so that interested clients can display the cancelled order to other customers.

### 3. Claiming a Cancelled Order (Customer-to-Customer)

- Redistributable orders (status `Redistribute`) can be claimed by other authenticated customers via the `/api/order/claim` endpoint.
- When a claim succeeds:
  - Ownership of the order is transferred to the claimant.
  - The order status is set back to `Food Processing`.
  - The order now appears in the claimant’s order history.
- Shelters do not claim orders directly from the queue. Only customers claim orders. Restaurant staff remain responsible for reassigning orders to shelters.

### 4. Restaurant-to-Shelter Donation

The restaurant can donate cancelled or redistributable orders to shelters:

- Partner shelters are stored in the `shelter` collection and may be seeded via `/api/shelters/seed`.
- Active shelters can be listed via `/api/shelters/list`.
- Restaurant staff use the admin dashboard to assign an order to a shelter, which calls `/api/order/assign-shelter` on the backend.
- `assign-shelter`:
  - Validates the order and shelter.
  - Ensures the order is in a suitable state (`Redistribute` or `Cancelled`).
  - Attaches shelter metadata to the order.
  - Records a donation entry in the `reroutes` collection.
- Donation history is available via `/api/reroutes`, which supports pagination and is designed to back the shelter-history view in the admin interface.

Shelters are passive recipients in this model: they do not directly interact with the API to “claim” food. The restaurant manages all redirection.

### 5. 3D Menu Visualization

The customer-facing frontend supports rendering of 3D models associated with menu items:

- When the restaurant uploads a dish, it may attach:
  - A standard 2D image, and
  - An optional 3D model asset.
- The frontend uses `three`, `@react-three/fiber`, and `@react-three/drei` to render a 3D carousel of dishes.
- This allows customers to inspect certain items in a more realistic and interactive way.

---

## Repository Structure

```text
backend/
  config/db.js
  controllers/
    cartController.js
    foodController.js
    orderController.js
    rerouteController.js
    shelterController.js
    userController.js
  middleware/
    auth.js
  models/
    foodModel.js
    orderModel.js
    rerouteModel.js
    shelterModel.js
    userModel.js
  routes/
    cartRoute.js
    foodRoute.js
    orderRoute.js
    rerouteRoute.js
    shelterRoute.js
    userRoute.js
  server.js
  package.json

frontend/
  src/...
  package.json

admin/
  src/...
  package.json
