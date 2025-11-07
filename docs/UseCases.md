# Flow-of-Events Use Cases — Food Redistribution & Delivery System

## **UC 1: User Registration and Login**

**Primary Actor:** Customer / Restaurant Owner / Admin  

**Preconditions:**  
1. The user has access to the web application.  
2. Internet connection is available.  

**Main Flow:**  
1. User navigates to the login or signup page.  
2. System prompts for credentials or registration details.  
3. User enters email, password.  
4. User is redirected to the appropriate dashboard.  

**Postconditions:**  
User session token is stored locally; user gains access to personalized dashboard.  

---

## **UC 2: Place Order**

**Primary Actor:** Customer  

**Preconditions:**  
1. User is logged in.  
2. Menu items are available in the database.  

**Main Flow:**  
1. Customer browses food items on the menu.  
2. Customer adds items to the cart.  
3. Customer confirms address and proceeds to payment.  
4. System creates order record in MongoDB.   
5. Order status set to *Food Processing*.  
6. Confirmation notification sent to customer and restaurant.  

**Postconditions:**  
Order stored in database; payment verified; delivery tracking begins.  

---

## **UC 3: Cancel Order and Redistribute**

**Primary Actor:** Customer  

**Preconditions:**  
1. Customer has at least one active order.  
2. Order is in *Food Processing* or *Ready for Pickup* state.  

**Main Flow:**  
1. Customer clicks “Cancel Order.”  
2. Backend updates order status to *Redistribute* in database.   
3. Real-time notification sent to those nearby users:  
   *“Order nearby has been cancelled — claim for discounted price.”*  
4. Cancelled order details remain visible to admin for tracking.  

**Subflows:**  
4a. If no nearby users are detected → order marked for donation to shelters.  

**Postconditions:**  
Cancelled order status = *Redistribute*; notifications dispatched to nearby users.  

---

## **UC 4: Claim Redistributed Order**

**Primary Actor:** Nearby Customer  

**Preconditions:**  
1. User received a redistribution notification.  
2. Order status = *Redistribute* in database.  

**Main Flow:**  
1. User clicks “Claim order” on the popup notification.  
2. System verifies order availability (first-come, first-serve).  
3. User completes checkout.  
4. Backend updates status to *Claimed – Redistributed*.   

**Postconditions:**  
Order ownership transferred; redistributive claim recorded in database.  

---

## **UC 5: Admin Manage Inventory and Orders**

**Primary Actor:** Admin / Restaurant Owner  

**Preconditions:**  
1. Admin authenticated.  
2. Items exist in inventory.  

**Main Flow:**  
1. Admin accesses Admin Dashboard.  
2. Admin adds, edits, or deletes menu items.  
3. Admin reviews list of all customer orders.  
4. Admin uploads optional 3D models for new menu items.  

**Postconditions:**  
Menu and order data persisted in database; changes visible to all users.  

---

## **UC 6: Donation to Community Shelters**

**Primary Actor:** System / Shelter Manager  

**Preconditions:**  
1. Redistributed order unclaimed after timeout (T).  

**Main Flow:**  
1. Detect expired Redistribute orders.  
2. System assigns them to a registered shelter.  
3. Shelter manager receives notification of incoming donation.  
4. Status updated.  

**Postconditions:**  
Unclaimed orders successfully reallocated to shelters — ensuring zero waste.  

---
