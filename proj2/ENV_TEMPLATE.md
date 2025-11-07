# Environment Variables Template

## Backend (.env)

```bash
# Backend Configuration
BACKEND_URL=http://localhost:4000
PORT=4000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xle9ert.mongodb.net/food-del

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Socket.IO
SOCKET_URL=http://localhost:4000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=debug
```

## Frontend (.env)

```bash
# Backend API URL
VITE_BACKEND_URL=http://localhost:4000

# Socket.IO URL
VITE_SOCKET_URL=http://localhost:4000
```

## Admin (.env)

```bash
# Backend API URL
VITE_BACKEND_URL=http://localhost:4000
```


