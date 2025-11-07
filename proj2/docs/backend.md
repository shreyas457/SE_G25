# BACKEND Documentation

## config/db.js

### connectDB

---

## controllers/cartController.js

### addToCart

---

### removeFromCart

---

### getCart

---

## controllers/foodController.js

### listFood

---

### addFood

---

### removeFood

---

## controllers/orderController.js

### canTransition

Allowed transitions:  - Food Processing   -> Out for delivery, Redistribute  - Out for delivery  -> Delivered, Redistribute  - Redistribute      -> Food Processing, Cancelled, Donated to shelter  - Cancelled         -> Donated to shelter (admin-only)  - Donated to shelter -> (terminal)  - Delivered         -> (terminal) /

---

### cancelOrder

---

### claimOrder

---

### placeOrder

---

### placeOrderCod

---

### listOrders

---

### userOrders

---

### updateStatus

---

### verifyOrder

---

### assignShelter

---

## controllers/rerouteController.js

### listReroutes

---

## controllers/shelterController.js

### seedShelters

---

### listShelters

---

## controllers/userController.js

### createToken

---

### loginUser

---

### registerUser

---

## middleware/auth.js

### authMiddleware

---

## server.js

### processNotificationQueue

---

### showNotificationToNextUser

---

### stopNotificationForOrder

---

### queueNotification

---

