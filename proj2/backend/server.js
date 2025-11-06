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



const app = express()
const port = process.env.PORT || 4000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Track connected users (excluding the one who cancelled)
let connectedUsers = new Map(); // Map of socketId -> userId

// Notification queue system
let notificationQueue = [];
let isProcessingNotification = false;
let currentNotificationIndex = 0;
let eligibleUsers = [];

const processNotificationQueue = () => {
  if (notificationQueue.length > 0 && !isProcessingNotification) {
    isProcessingNotification = true;
    currentNotificationIndex = 0;
    
    const notification = notificationQueue[0];
    
    // Get eligible users (all except the one who cancelled)
    eligibleUsers = Array.from(connectedUsers.entries())
      .filter(([socketId, userId]) => userId !== notification.cancelledByUserId)
      .map(([socketId]) => socketId);
    
    console.log(`Showing notification to ${eligibleUsers.length} users one by one`);
    
    showNotificationToNextUser(notification);
  }
};

const showNotificationToNextUser = (notification) => {
  if (currentNotificationIndex < eligibleUsers.length) {
    const socketId = eligibleUsers[currentNotificationIndex];
    
    console.log('showing notification to user ', socketId)
    console.log(`Showing notification to user ${currentNotificationIndex + 1}/${eligibleUsers.length}`);
    
    // Send to specific user only
    io.to(socketId).emit('orderCancelled', notification);
    
    currentNotificationIndex++;
    
    // Wait 5 seconds before showing to next user
    setTimeout(() => {
      showNotificationToNextUser(notification);
    }, 5000);
  } else {
    // All users have been notified, remove from queue and process next
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

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Store userId when user connects (you'll need to send this from client)
  socket.on('register', (userId) => {
    connectedUsers.set(socket.id, userId);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    connectedUsers.delete(socket.id);
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

app.get("/", (req, res) => {
    res.send("API Working")
});
app.use("/api/reroutes", rerouteRouter);   // ← add this

httpServer.listen(port, () => console.log(`Server started on http://localhost:${port}`))