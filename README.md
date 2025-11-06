# SE_G25
CSC 510 SE Group 25 Project

# Food Delivery System - Backend

A DoorDash-like food delivery system API built with FastAPI and PostgreSQL.

## Database Schema

### Tables:
- **users** - Customer, restaurant owner, driver, and admin accounts
- **addresses** - User delivery addresses
- **restaurants** - Restaurant information and locations
- **categories** - Food categories (Burgers, Pizza, Sushi, etc.)
- **menu_items** - Restaurant menu items with pricing and details
- **orders** - Customer orders with status tracking
- **order_items** - Individual items in each order
- **drivers** - Driver profiles and availability
- **payments** - Payment transaction records
- **reviews** - Restaurant reviews and ratings

## Project Structure

```
backend/
├── main.py           # FastAPI application with all endpoints
├── models.py         # SQLAlchemy database models
├── schemas.py        # Pydantic schemas for validation
├── database.py       # Database configuration
├── seed_data.py      # Script to populate sample data
├── requirements.txt  # Python dependencies
└── Dockerfile        # Docker configuration
```

## Setup Instructions

### Option 1: With Docker Compose (Recommended)

From your project root:

```bash
docker-compose up --build
```

This will start:
- PostgreSQL database
- FastAPI backend on http://localhost:8000
- Next.js frontend on http://localhost:3000

### Option 2: Local Development

1. **Install dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Start PostgreSQL:**
```bash
docker-compose up
```

## Seed Sample Data

After the database is running, populate it with sample data:

```bash
cd backend
python seed_data.py
```

This creates:
- 4 sample users (customer, 2 restaurant owners, driver)
- 4 restaurants
- 8 food categories
- 17 menu items across all restaurants

### Sample Credentials:
- **Customer:** customer@example.com / password123
- **Owner:** owner@example.com / password123
- **Driver:** driver@example.com / password123

## API Documentation

Once running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{user_id}` - Get user by ID

### Restaurants
- `POST /api/restaurants` - Create restaurant
- `GET /api/restaurants` - List restaurants (with filters)
- `GET /api/restaurants/{id}` - Get restaurant details
- `PUT /api/restaurants/{id}` - Update restaurant

### Categories
- `POST /api/categories` - Create category
- `GET /api/categories` - List all categories

### Menu Items
- `POST /api/menu-items` - Create menu item
- `GET /api/menu-items` - List menu items (with filters)
- `GET /api/menu-items/{id}` - Get menu item details

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - List orders (with filters)
- `GET /api/orders/{id}` - Get order details
- `PUT /api/orders/{id}/status` - Update order status

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews` - List reviews (with filters)

### Drivers
- `POST /api/drivers` - Create driver profile
- `GET /api/drivers` - List drivers
- `GET /api/drivers/{id}` - Get driver details
- `PUT /api/drivers/{id}/availability` - Update availability

### Statistics
- `GET /api/stats/restaurants/{id}` - Restaurant statistics
- `GET /api/stats/users/{id}` - User statistics

## Database Commands

```bash
# Access PostgreSQL CLI
docker exec -it postgres_db psql -U myuser -d signupdb

# View all tables
\dt

# View users
SELECT * FROM users;

# View restaurants
SELECT id, name, city, rating FROM restaurants;

# View orders
SELECT id, order_number, status, total FROM orders;

# Exit PostgreSQL
\q
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- Default: `postgresql://myuser:mypassword@localhost:5432/signupdb`

## Features

✅ User authentication with password hashing
✅ Role-based access (Customer, Restaurant Owner, Driver, Admin)
✅ Restaurant management with location data
✅ Menu item management with categories
✅ Order creation and tracking
✅ Real-time order status updates
✅ Review and rating system
✅ Driver assignment and tracking
✅ Payment tracking
✅ Statistics and analytics

## Technologies

- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **PostgreSQL** - Database
- **Pydantic** - Data validation
- **Passlib** - Password hashing
- **Docker** - Containerization

## Updates & Announcements

We post short updates whenever we ship features or milestones.

- Full changelog: see **[docs/updates.md](docs/updates.md)**
- Latest highlights:
   — Claim Order feature: cancelled → Redistribute → Claimed, with real-time pop-ups.
 
