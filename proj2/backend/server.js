import express from "express"
import cors from 'cors'
import { connectDB } from "./config/db.js"
import userRouter from "./routes/userRoute.js"
import foodRouter from "./routes/foodRoute.js"
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import shelterRouter from "./routes/shelterRoute.js"
import { createServer } from 'http'
import { Server } from 'socket.io'
import rerouteRouter from "./routes/rerouteRoute.js";
const allowedOrigins = [
  process.env.FRONTEND_URL,  
  "http://localhost:5173",    // Vite dev
  "http://localhost:4173",    // Vite preview (build)
  "http://localhost:3000",    // if you ever use `serve dist`
].filter(Boolean);            


const app = express()
const port = process.env.PORT || 4000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Track connected users
let connectedUsers = new Map();

// Notification queue system
let notificationQueue = [];
let isProcessingNotification = false;
let currentNotificationIndex = 0;
let eligibleUsers = [];
let currentNotificationTimeout = null; // Track the timeout
let claimedOrders = new Set(); // Track claimed orders

const processNotificationQueue = () => {
  if (notificationQueue.length > 0 && !isProcessingNotification) {
    isProcessingNotification = true;
    currentNotificationIndex = 0;
    
    const notification = notificationQueue[0];
    
    // Skip if order was already claimed
    if (claimedOrders.has(notification.orderId)) {
      console.log(`Order ${notification.orderId} already claimed, skipping`);
      notificationQueue.shift();
      isProcessingNotification = false;
      processNotificationQueue();
      return;
    }
    
    // Get eligible users (all except the one who cancelled)
    eligibleUsers = Array.from(connectedUsers.entries())
      .filter(([socketId, userId]) => userId !== notification.cancelledByUserId)
      .map(([socketId]) => socketId);
    
    console.log(`Showing notification to ${eligibleUsers.length} users one by one`);
    
    showNotificationToNextUser(notification);
  }
};

const showNotificationToNextUser = (notification) => {
  // Check if order was claimed before showing to next user
  if (claimedOrders.has(notification.orderId)) {
    console.log(`Order ${notification.orderId} was claimed, stopping queue`);
    notificationQueue.shift();
    isProcessingNotification = false;
    processNotificationQueue();
    return;
  }

  if (currentNotificationIndex < eligibleUsers.length) {
    const socketId = eligibleUsers[currentNotificationIndex];
    
    console.log(`Showing notification to user ${currentNotificationIndex + 1}/${eligibleUsers.length}`);
    
    // Send to specific user only
    io.to(socketId).emit('orderCancelled', notification);
    
    currentNotificationIndex++;
    
    // Wait 5 seconds before showing to next user
    currentNotificationTimeout = setTimeout(() => {
      showNotificationToNextUser(notification);
    }, 5000);
  } else {
    // All users have been notified, remove from queue and process next
    notificationQueue.shift();
    isProcessingNotification = false;
    processNotificationQueue();
  }
};

// Stop notification queue for a specific order
const stopNotificationForOrder = (orderId) => {
  claimedOrders.add(orderId);
  
  // Clear the current timeout if it exists
  if (currentNotificationTimeout) {
    clearTimeout(currentNotificationTimeout);
    currentNotificationTimeout = null;
  }
  
  // Move to next in queue
  if (isProcessingNotification) {
    notificationQueue.shift();
    isProcessingNotification = false;
    processNotificationQueue();
  }
};

// Add notification to queue
const queueNotification = (notification) => {
  notificationQueue.push(notification);
  processNotificationQueue();
};

// Make functions available to routes
app.set('socketio', io);
app.set('queueNotification', queueNotification);
app.set('stopNotificationForOrder', stopNotificationForOrder);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Store userId when user connects
  socket.on('register', (userId) => {
    connectedUsers.set(socket.id, userId);
    console.log(`User ${userId} registered with socket ${socket.id}`);
    console.log('Total connected users:', connectedUsers.size);
  });
  
  // Handle order claim
  socket.on('claimOrder', (data) => {
    const { orderId, userId } = data;
    console.log(`User ${userId} claimed order ${orderId}`);
    
    // Stop showing notification to other users
    stopNotificationForOrder(orderId);
    
    // Broadcast to all users that order was claimed
    io.emit('orderClaimed', { orderId, userId });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    connectedUsers.delete(socket.id);
    console.log('Total connected users:', connectedUsers.size);
  });
});

app.use(express.json())
app.use(cors())

connectDB()

app.use("/api/user", userRouter)
app.use("/api/food", foodRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/shelters", shelterRouter)
app.use("/api/reroutes", rerouteRouter);

app.get("/", (req, res) => {
    res.send("API Working")
});

httpServer.listen(port, () => console.log(`Server started on http://localhost:${port}`))