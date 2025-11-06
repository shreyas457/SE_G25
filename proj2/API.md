# ByteBite Backend API

This document specifies the RESTful API endpoints implemented in the **ByteBite backend**, a Node.js + Express + MongoDB service.  
All routes are rooted at:

```
http://localhost:4000/api
```

Unless otherwise noted:

- Requests and responses use **JSON**.
- Authenticated routes require a **JWT token** provided in the request header as:
  ```
  token: <jwt-token>
  ```
- The backend follows a **single-restaurant model**:
  - Customers can cancel or claim orders.
  - The restaurant alone can redirect cancelled orders to shelters.

---

## 1. Authentication

### `POST /user/register`
Register a new customer account.

**Request Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "plaintext-password"
}
```

**Response**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "token": "jwt-token"
}
```

---

### `POST /user/login`
Authenticate an existing customer.

**Request Body**
```json
{
  "email": "john@example.com",
  "password": "plaintext-password"
}
```

**Response**
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "jwt-token"
}
```

---

## 2. Menu (Food Items)

Base path: `/food`

### `GET /food/list`
Retrieve all available menu items.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f2...",
      "name": "Paneer Biryani",
      "description": "Spicy rice with cottage cheese.",
      "price": 10.99,
      "category": "Main Course",
      "image": "/uploads/paneer-biryani.jpg",
      "model3D": "/uploads/models/paneer-biryani.glb"
    }
  ]
}
```

---

### `POST /food/add`
Add a new menu item (admin only).

**Form Data Fields**
- `name`
- `description`
- `price`
- `category`
- `image` (optional)
- `model3D` (optional 3D model upload)

---

### `POST /food/remove`
Remove a menu item (admin only).

**Request Body**
```json
{ "id": "65f2..." }
```

**Response**
```json
{ "success": true, "message": "Item removed successfully." }
```

---

## 3. Cart

Base path: `/cart`  
All cart operations require authentication.

### `POST /cart/get`
Fetch the user’s current cart.

**Response**
```json
{
  "success": true,
  "cartData": {
    "65f2...": 2,
    "65f3...": 1
  }
}
```

---

### `POST /cart/add`
Add an item to the cart.

**Request Body**
```json
{
  "itemId": "65f2...",
  "quantity": 1
}
```

**Response**
```json
{ "success": true, "message": "Item added to cart." }
```

---

### `POST /cart/remove`
Remove an item from the cart.

**Request Body**
```json
{
  "itemId": "65f2..."
}
```

---

## 4. Orders

Base path: `/order`

### `POST /order/place`
Create a new order via Stripe payment.

**Request Body**
```json
{
  "items": [
    { "itemId": "65f2...", "quantity": 2 }
  ],
  "amount": 25.50,
  "address": {
    "street": "123 Hillsborough St",
    "city": "Raleigh",
    "zipcode": "27606"
  }
}
```

**Response**
```json
{
  "success": true,
  "session_url": "https://checkout.stripe.com/test-session"
}
```

---

### `POST /order/verify`
Verify payment status after Stripe checkout.

**Request Body**
```json
{
  "orderId": "65f9...",
  "success": "true"
}
```

**Behavior**
- If `success = true`: marks the order as **paid**.
- Otherwise: deletes the unpaid order.

---

### `POST /order/placecod`
Create a new order with **Cash on Delivery**.

**Request Body** — same as `/order/place`

**Response**
```json
{ "success": true, "message": "Order placed (COD)." }
```

---

### `GET /order/list` (Admin)
List all orders across all users.

**Response**
```json
{
  "success": true,
  "data": [ /* all order objects */ ]
}
```

---

### `POST /order/userorders`
List orders belonging to the current user.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f9...",
      "items": [ ... ],
      "status": "Delivered",
      "amount": 25.5,
      "payment": true
    }
  ]
}
```

---

## 5. Order Status Updates

### `POST /order/status` (Admin)
Update the status of an order.

**Request Body**
```json
{
  "orderId": "65f9...",
  "status": "Out for delivery"
}
```

**Allowed Transitions**
`Food Processing → Out for delivery → Delivered`  
or  
`Food Processing → Redistribute → Cancelled`

---

## 6. Order Cancellation and Claiming

### `POST /order/cancel_order`
Cancel an order as the current owner.

**Request Body**
```json
{
  "orderId": "65f9..."
}
```

**Behavior**
- Verifies that the requester owns the order.
- If cancellable, sets `status = "Redistribute"`.
- Emits a Socket.IO event so other users can see the cancelled order as **claimable**.

---

### `POST /order/claim`
Claim a redistributed order (customer-to-customer).

**Request Body**
```json
{
  "orderId": "65f9..."
}
```

**Behavior**
- Only works for orders with `status = "Redistribute"`.
- Transfers ownership (`claimedBy = currentUser`).
- Resets status to `Food Processing`.

**Response**
```json
{
  "success": true,
  "message": "Order claimed successfully."
}
```

---

## 7. Shelters

Base path: `/shelters`

### `GET /shelters/list`
List all registered active shelters.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65fa...",
      "name": "Raleigh Community Shelter",
      "contactName": "Jane Smith",
      "contactEmail": "jane@raleighshelter.org",
      "address": {
        "city": "Raleigh",
        "state": "NC"
      },
      "active": true
    }
  ]
}
```

---

### `POST /shelters/seed` (Admin)
Seed the database with default shelter entries if none exist.

---

## 8. Assigning Orders to Shelters

### `POST /order/assign-shelter` (Admin only)
Assign a cancelled or redistributable order to a partner shelter.

**Request Body**
```json
{
  "orderId": "65f9...",
  "shelterId": "65fa..."
}
```

**Behavior**
- Validates both IDs.
- Ensures order is `Redistribute` or `Cancelled`.
- Marks it as **donated**, records in `reroutes` collection.

**Response**
```json
{
  "success": true,
  "message": "Order assigned to shelter successfully."
}
```

---

## 9. Donation (Reroute) History

Base path: `/reroutes`

### `GET /reroutes`
List all donated or reassigned orders.

**Query Parameters**
- `page` (default: 1)
- `limit` (default: 20)

**Response**
```json
{
  "success": true,
  "page": 1,
  "limit": 20,
  "total": 12,
  "data": [
    {
      "_id": "66ab...",
      "orderId": "65f9...",
      "shelterName": "Raleigh Community Shelter",
      "createdAt": "2025-11-05T18:00:00Z"
    }
  ]
}
```

---

## 10. Socket.IO Events

ByteBite uses WebSockets for real-time order redistribution updates.

| Event | Direction | Description |
|--------|------------|-------------|
| `orderCancelled` | Server → Clients | Notifies all connected customers that an order has been moved to `Redistribute`. |
| `orderClaimed` | Server → Clients | Informs clients that a previously redistributable order has been claimed. |

---

## 11. Error Handling

Common response structure for errors:

```json
{
  "success": false,
  "message": "Description of the error."
}
```

HTTP Status Codes:
- `200` – Successful request  
- `400` – Validation or logical error  
- `401` – Unauthorized (missing/invalid token)  
- `404` – Resource not found  
- `500` – Server error

---

## Summary of Roles

| Role | Capabilities |
|------|---------------|
| **Customer** | Register, login, browse menu, order, cancel, claim redistributed orders |
| **Restaurant Admin** | Manage menu, update statuses, redistribute orders to shelters |
| **Shelter** | Passive recipient of donations (no login interaction) |

---

**Maintainers:**  
*Developed by NCSU Team G25 (2025).*  
Licensed under the [MIT License](LICENSE).
