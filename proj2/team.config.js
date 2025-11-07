/**
 * TEAM CONFIGURATION FILE
 * =======================
 * 
 * This file was used by the SE_G25 team to share configuration
 * and project settings across team members during development.
 * 
 * Last Updated: 2024-01-XX
 * Team: SE_G25
 * Project: ByteBite - Food Delivery Platform with Redistribution System
 * 
 * USAGE:
 * - Import this file in your application code
 * - Update values as needed for your environment
 * - Keep sensitive data in .env files (see .env.example)
 * 
 * TEAM COLLABORATION NOTES:
 * - [Team Member 1] Updated backend port to 4000 to avoid macOS ControlCenter conflict
 * - [Team Member 2] Added Socket.IO configuration for real-time notifications
 * - [Team Member 3] Configured MongoDB connection string
 * - [Team Member 4] Set up frontend and admin ports
 * - [Team Member 5] Added test configuration settings
 */

// ============================================================================
// PROJECT STRUCTURE
// ============================================================================
export const PROJECT_STRUCTURE = {
  backend: {
    path: './backend',
    port: 4000,
    entryPoint: 'server.js',
    testFramework: 'Jest',
    testCommand: 'npm test',
    coverageCommand: 'npm run test:coverage'
  },
  frontend: {
    path: './frontend',
    port: 5173,
    entryPoint: 'src/main.jsx',
    testFramework: 'Vitest',
    testCommand: 'npm test',
    coverageCommand: 'npm run test:coverage'
  },
  admin: {
    path: './admin',
    port: 5174,
    entryPoint: 'src/main.jsx',
    testFramework: 'Vitest',
    testCommand: 'npm test',
    coverageCommand: 'npm run test:coverage'
  }
};

// ============================================================================
// API CONFIGURATION
// ============================================================================
export const API_CONFIG = {
  // Base URL for backend API
  // NOTE: [Team Member 1] Changed from localhost:5000 to 4000 due to port conflict
  baseURL: process.env.BACKEND_URL || 'http://localhost:4000',
  
  // API Endpoints
  endpoints: {
    // User endpoints
    user: {
      register: '/api/user/register',
      login: '/api/user/login'
    },
    
    // Food endpoints
    food: {
      list: '/api/food/list',
      add: '/api/food/add',
      remove: '/api/food/remove'
    },
    
    // Cart endpoints (require authentication)
    cart: {
      get: '/api/cart/get',
      add: '/api/cart/add',
      remove: '/api/cart/remove'
    },
    
    // Order endpoints
    order: {
      place: '/api/order/place',
      placeCod: '/api/order/placecod',
      list: '/api/order/list',
      userOrders: '/api/order/userorders',
      updateStatus: '/api/order/status',
      verify: '/api/order/verify',
      cancel: '/api/order/cancel_order',
      claim: '/api/order/claim',
      assignShelter: '/api/order/assign-shelter'
    },
    
    // Shelter endpoints
    shelter: {
      seed: '/api/shelters/seed',
      list: '/api/shelters/list'
    },
    
    // Reroute endpoints
    reroute: {
      list: '/api/reroutes'
    }
  },
  
  // Request timeout (milliseconds)
  timeout: 30000,
  
  // CORS allowed origins
  // NOTE: [Team Member 2] Added multiple origins for development flexibility
  allowedOrigins: [
    process.env.FRONTEND_URL,
    'http://localhost:5173',    // Vite dev server
    'http://localhost:4173',    // Vite preview
    'http://localhost:3000'     // Alternative dev server
  ].filter(Boolean)
};

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================
export const DB_CONFIG = {
  // MongoDB connection string
  // NOTE: [Team Member 3] Using MongoDB Atlas cluster
  // WARNING: In production, use environment variables for credentials
  connectionString: process.env.MONGODB_URI || 
    'mongodb+srv://SE_G25:SE_G25@cluster0.xle9ert.mongodb.net/food-del',
  
  // Database name
  databaseName: 'food-del',
  
  // Connection options
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  
  // Collections
  collections: {
    users: 'users',
    food: 'foods',
    orders: 'orders',
    shelters: 'shelters',
    reroutes: 'reroutes'
  }
};

// ============================================================================
// AUTHENTICATION CONFIGURATION
// ============================================================================
export const AUTH_CONFIG = {
  // JWT Secret Key
  // NOTE: [Team Member 1] Must be set in .env file for production
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  
  // Token expiration (optional - if implemented)
  tokenExpiration: '7d',
  
  // Password requirements
  passwordRequirements: {
    minLength: 8,
    requireUppercase: false,
    requireLowercase: false,
    requireNumbers: false,
    requireSpecialChars: false
  }
};

// ============================================================================
// SOCKET.IO CONFIGURATION
// ============================================================================
export const SOCKET_CONFIG = {
  // Socket.IO server URL
  url: process.env.SOCKET_URL || 'http://localhost:4000',
  
  // CORS configuration for Socket.IO
  cors: {
    origin: API_CONFIG.allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  
  // Socket events
  events: {
    // Client to server
    register: 'register',
    claimOrder: 'claimOrder',
    
    // Server to client
    orderCancelled: 'orderCancelled',
    orderClaimed: 'orderClaimed',
    connect: 'connect',
    disconnect: 'disconnect'
  },
  
  // Notification queue settings
  notification: {
    intervalBetweenUsers: 5000, // 5 seconds
    maxRetries: 3
  }
};

// ============================================================================
// FILE UPLOAD CONFIGURATION
// ============================================================================
export const UPLOAD_CONFIG = {
  // Maximum file sizes
  maxFileSizes: {
    image: 5 * 1024 * 1024,      // 5MB for images
    model3D: 12 * 1024 * 1024     // 12MB for 3D models
  },
  
  // Allowed MIME types
  allowedMimeTypes: {
    image: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
    model3D: ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream']
  },
  
  // Storage configuration
  storage: {
    type: 'memory', // 'memory' or 'disk'
    destination: './uploads' // Only used if type is 'disk'
  }
};

// ============================================================================
// ORDER STATUS CONFIGURATION
// ============================================================================
export const ORDER_STATUS = {
  // Valid status values
  values: [
    'Food Processing',
    'Out for delivery',
    'Delivered',
    'Redistribute',
    'Cancelled',
    'Donated'
  ],
  
  // Status transitions (from -> to)
  // NOTE: [Team Member 4] Defined state machine for order status
  allowedTransitions: {
    'Food Processing': ['Out for delivery', 'Cancelled', 'Redistribute'],
    'Out for delivery': ['Delivered', 'Cancelled', 'Redistribute'],
    'Delivered': [],
    'Redistribute': ['Food Processing', 'Donated'],
    'Cancelled': ['Donated'],
    'Donated': []
  },
  
  // User-cancelable statuses
  userCancelable: ['Food Processing', 'Out for delivery'],
  
  // Default status
  default: 'Food Processing'
};

// ============================================================================
// PAYMENT CONFIGURATION
// ============================================================================
export const PAYMENT_CONFIG = {
  // Payment methods
  methods: {
    cod: 'cod',           // Cash on Delivery
    stripe: 'stripe'       // Stripe payment
  },
  
  // Delivery charge
  deliveryCharge: 5,
  
  // Currency
  currency: '$',
  
  // Stripe configuration (if implemented)
  stripe: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
  }
};

// ============================================================================
// TESTING CONFIGURATION
// ============================================================================
export const TEST_CONFIG = {
  // Test coverage thresholds
  coverage: {
    backend: {
      statements: 70,
      branches: 65,
      functions: 70,
      lines: 70
    },
    frontend: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    },
    admin: {
      statements: 75,
      branches: 70,
      functions: 75,
      lines: 75
    }
  },
  
  // Test timeout (milliseconds)
  timeout: 30000,
  
  // Test environment
  environment: {
    backend: 'node',
    frontend: 'jsdom',
    admin: 'jsdom'
  }
};

// ============================================================================
// DEVELOPMENT CONFIGURATION
// ============================================================================
export const DEV_CONFIG = {
  // Development mode
  isDevelopment: process.env.NODE_ENV !== 'production',
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    enableConsole: true,
    enableFile: false
  },
  
  // Hot reload
  hotReload: {
    enabled: true,
    port: 5173 // Vite default
  }
};

// ============================================================================
// SHELTER CONFIGURATION
// ============================================================================
export const SHELTER_CONFIG = {
  // Default shelters (seeded on first run)
  defaultShelters: [
    {
      name: "City Shelter – Raleigh",
      contactName: "John Smith",
      contactPhone: "+1 919 555 0111",
      contactEmail: "john.smith@cityshelter.org",
      capacity: 200,
      address: { street: "101 Main St", city: "Raleigh", state: "NC", zipcode: "27601" }
    },
    // ... (other shelters defined in shelterController.js)
  ],
  
  // Pagination for shelter history
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100
  }
};

// ============================================================================
// EXPORT DEFAULT CONFIG
// ============================================================================
export default {
  project: PROJECT_STRUCTURE,
  api: API_CONFIG,
  database: DB_CONFIG,
  auth: AUTH_CONFIG,
  socket: SOCKET_CONFIG,
  upload: UPLOAD_CONFIG,
  order: ORDER_STATUS,
  payment: PAYMENT_CONFIG,
  test: TEST_CONFIG,
  development: DEV_CONFIG,
  shelter: SHELTER_CONFIG
};


