
---

### `CHANGELOG.md`

```md
# Changelog

All notable changes to this project will be documented in this file.

The format is inspired by “Keep a Changelog” and this project adheres to semantic versioning where possible.

---

## [0.1.0] – 2025-11-05

### Added

- Initial public documentation for the project:
  - `README.md` describing the single-restaurant model, cancellation-based redistribution, and 3D menu visualization.
  - `API.md` specifying backend endpoints for users, food, cart, orders, shelters, and reroute history.
  - `CONTRIBUTING.md` with contribution workflow and coding guidelines.
  - `CODE_OF_CONDUCT.md` adapted from the Contributor Covenant.
  - `LICENSE` using the MIT license with NCSU Team G25 attribution.

- Core feature set in the backend:
  - User registration and login with JWT-based authentication.
  - Menu management with optional 3D model uploads for dishes.
  - Cart operations (add, remove, get) bound to authenticated users.
  - Order placement with Stripe-based flow and cash-on-delivery.
  - Order status finite-state machine, including `Food Processing`, `Out for delivery`, `Delivered`, `Redistribute`, and `Cancelled`.
  - Customer-driven cancellation that moves orders into a `Redistribute` queue.
  - Customer-to-customer claiming of redistributable orders.
  - Restaurant-driven assignment of redistributed or cancelled orders to shelters.
  - Reroute (donation) history via a dedicated `reroutes` collection.

- Frontend and admin applications:
  - Customer-facing React + Vite frontend for ordering, claiming, and 3D viewing.
  - Admin React + Vite dashboard for menu management, order monitoring, and shelter assignment.

---

[0.1.0]: https://example.com/bytebite/releases/0.1.0
