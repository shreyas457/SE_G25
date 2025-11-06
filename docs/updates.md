# Project Changelog (Updates & Announcements)

## 2025-11-03
- **Claim Order Flow**: DB now records `Claimed` with `claimedBy` + `claimedAt`. Real-time pop-ups enable instant claiming.
- **Frontend Integration**: Implemented notification toasts with live claim and dismiss buttons.
- **Status Sync**: Order status now transitions automatically from *Food Processing* → *Redistribute* → *Claimed*.

## 2025-11-02
- **Admin Page Updates**: added history page to track shelter redistribution in the admin page
  
## 2025-10-30
- **Admin Dashboard Enhancements**: Added management options for food items, orders, and shelter history tracking.
- **UI Improvements**: Streamlined admin navigation and responsive layout for better accessibility.
- **Real-time Updates**: Integrated Socket.IO in admin view to reflect live order status changes.

## 2025-10-28
- **Shelter Distribution Pipeline**: Built basic shelter/NGO database + end-of-day donation marking feature.
- **Donation Workflow**: Restaurants and delivery agents can now flag surplus meals for redistribution.
- **Data Persistence**: Shelters’ history stored for weekly reporting and analytics.

## 2025-10-25
- **3D Visualization**: Realistic 3D food previews implemented to help users gauge portion sizes.
- **User Experience Update**: Enhanced menu interactions and animations in Vite + React frontend.
- **Reduced Cancellations**: Feature aimed at improving order retention through better visualization.

## 2025-10-20
- **Cancel-to-Redistribute Workflow**: Orders automatically marked *Redistribute* upon cancellation and broadcasted via Socket.IO.
- **Notification Listener Module**: Added live order alerts for users using `react-hot-toast`.
- **Database Update Logic**: Introduced backend API for updating order states in MongoDB via Express routes.

## 2025-10-18
- **Socket.IO Integration**: Established real-time communication between backend and frontend.
- **User Registration with Socket**: Users automatically register their IDs on socket connection for targeted updates.
- **Event Handling**: Defined `orderCancelled` and `orderClaimed` events for inter-user notifications.

## 2025-10-10
- **Core Backend Setup**: Initialized Express server, MongoDB connection, and Mongoose models.
- **API Routes Created**: Added order, user, and food routes with basic CRUD operations.
- **Auth Middleware**: Implemented JWT-based authentication and token verification.

