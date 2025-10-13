from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from typing import List
import uuid

from database import engine, get_db
from models import Base, User, Restaurant, MenuItem, Order, OrderItem, Category, Review, Driver
from schemas import (
    UserCreate, UserResponse,
    RestaurantCreate, RestaurantResponse,
    MenuItemCreate, MenuItemResponse,
    CategoryCreate, CategoryResponse,
    OrderCreate, OrderResponse,
    ReviewCreate, ReviewResponse,
    DriverCreate, DriverResponse
)

# Create all tables
Base.metadata.create_all(bind=engine)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# FastAPI app
app = FastAPI(
    title="Food Delivery API",
    description="DoorDash-like Food Delivery System",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def generate_order_number() -> str:
    return f"ORD-{uuid.uuid4().hex[:8].upper()}"

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Welcome to Food Delivery API",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "users": "/api/users",
            "restaurants": "/api/restaurants",
            "menu": "/api/menu-items",
            "orders": "/api/orders"
        }
    }

# ==================== USER ENDPOINTS ====================

@app.post("/api/auth/signup", response_model=UserResponse, status_code=201)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create a new user account"""
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = hash_password(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        role=user_data.role,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/api/users", response_model=List[UserResponse])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all users"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@app.get("/api/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ==================== RESTAURANT ENDPOINTS ====================

@app.post("/api/restaurants", response_model=RestaurantResponse, status_code=201)
def create_restaurant(restaurant_data: RestaurantCreate, owner_id: int, db: Session = Depends(get_db)):
    """Create a new restaurant"""
    # Verify owner exists
    owner = db.query(User).filter(User.id == owner_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    
    new_restaurant = Restaurant(**restaurant_data.dict(), owner_id=owner_id)
    db.add(new_restaurant)
    db.commit()
    db.refresh(new_restaurant)
    return new_restaurant

@app.get("/api/restaurants", response_model=List[RestaurantResponse])
def get_restaurants(
    skip: int = 0,
    limit: int = 100,
    city: str = None,
    cuisine_type: str = None,
    is_open: bool = None,
    db: Session = Depends(get_db)
):
    """Get all restaurants with optional filters"""
    query = db.query(Restaurant)
    
    if city:
        query = query.filter(Restaurant.city == city)
    if cuisine_type:
        query = query.filter(Restaurant.cuisine_type == cuisine_type)
    if is_open is not None:
        query = query.filter(Restaurant.is_open == is_open)
    
    restaurants = query.offset(skip).limit(limit).all()
    return restaurants

@app.get("/api/restaurants/{restaurant_id}", response_model=RestaurantResponse)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    """Get restaurant by ID"""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

@app.put("/api/restaurants/{restaurant_id}", response_model=RestaurantResponse)
def update_restaurant(restaurant_id: int, restaurant_data: RestaurantCreate, db: Session = Depends(get_db)):
    """Update restaurant"""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    for key, value in restaurant_data.dict(exclude_unset=True).items():
        setattr(restaurant, key, value)
    
    db.commit()
    db.refresh(restaurant)
    return restaurant

# ==================== CATEGORY ENDPOINTS ====================

@app.post("/api/categories", response_model=CategoryResponse, status_code=201)
def create_category(category_data: CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category"""
    new_category = Category(**category_data.dict())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

@app.get("/api/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """Get all categories"""
    categories = db.query(Category).filter(Category.is_active == True).order_by(Category.display_order).all()
    return categories

# ==================== MENU ITEM ENDPOINTS ====================

@app.post("/api/menu-items", response_model=MenuItemResponse, status_code=201)
def create_menu_item(menu_item_data: MenuItemCreate, db: Session = Depends(get_db)):
    """Create a new menu item"""
    # Verify restaurant exists
    restaurant = db.query(Restaurant).filter(Restaurant.id == menu_item_data.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    new_item = MenuItem(**menu_item_data.dict())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@app.get("/api/menu-items", response_model=List[MenuItemResponse])
def get_menu_items(
    restaurant_id: int = None,
    category_id: int = None,
    is_available: bool = True,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get menu items with optional filters"""
    query = db.query(MenuItem)
    
    if restaurant_id:
        query = query.filter(MenuItem.restaurant_id == restaurant_id)
    if category_id:
        query = query.filter(MenuItem.category_id == category_id)
    if is_available is not None:
        query = query.filter(MenuItem.is_available == is_available)
    
    items = query.offset(skip).limit(limit).all()
    return items

@app.get("/api/menu-items/{item_id}", response_model=MenuItemResponse)
def get_menu_item(item_id: int, db: Session = Depends(get_db)):
    """Get menu item by ID"""
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return item

# ==================== ORDER ENDPOINTS ====================

@app.post("/api/orders", response_model=OrderResponse, status_code=201)
def create_order(order_data: OrderCreate, customer_id: int, db: Session = Depends(get_db)):
    """Create a new order"""
    # Verify customer exists
    customer = db.query(User).filter(User.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Verify restaurant exists
    restaurant = db.query(Restaurant).filter(Restaurant.id == order_data.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Calculate order totals
    subtotal = 0.0
    order_items_list = []
    
    for item_data in order_data.items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == item_data.menu_item_id).first()
        if not menu_item:
            raise HTTPException(status_code=404, detail=f"Menu item {item_data.menu_item_id} not found")
        if not menu_item.is_available:
            raise HTTPException(status_code=400, detail=f"{menu_item.name} is not available")
        
        item_total = menu_item.price * item_data.quantity
        subtotal += item_total
        order_items_list.append({
            "menu_item_id": menu_item.id,
            "quantity": item_data.quantity,
            "price": menu_item.price,
            "special_instructions": item_data.special_instructions
        })
    
    # Calculate fees
    delivery_fee = restaurant.delivery_fee
    tax = subtotal * 0.08  # 8% tax
    total = subtotal + delivery_fee + tax + order_data.tip
    
    # Create order
    new_order = Order(
        customer_id=customer_id,
        restaurant_id=order_data.restaurant_id,
        order_number=generate_order_number(),
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        tax=tax,
        tip=order_data.tip,
        total=total,
        delivery_address=order_data.delivery_address,
        delivery_latitude=order_data.delivery_latitude,
        delivery_longitude=order_data.delivery_longitude,
        delivery_instructions=order_data.delivery_instructions
    )
    
    db.add(new_order)
    db.flush()  # Get the order ID
    
    # Create order items
    for item_data in order_items_list:
        order_item = OrderItem(order_id=new_order.id, **item_data)
        db.add(order_item)
    
    db.commit()
    db.refresh(new_order)
    return new_order

@app.get("/api/orders", response_model=List[OrderResponse])
def get_orders(
    customer_id: int = None,
    restaurant_id: int = None,
    status: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get orders with optional filters"""
    query = db.query(Order)
    
    if customer_id:
        query = query.filter(Order.customer_id == customer_id)
    if restaurant_id:
        query = query.filter(Order.restaurant_id == restaurant_id)
    if status:
        query = query.filter(Order.status == status)
    
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return orders

@app.get("/api/orders/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get order by ID"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@app.put("/api/orders/{order_id}/status")
def update_order_status(order_id: int, status: str, db: Session = Depends(get_db)):
    """Update order status"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    from models import OrderStatus
    try:
        order.status = OrderStatus(status)
        db.commit()
        db.refresh(order)
        return {"message": "Order status updated", "order": order}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status value")

# ==================== REVIEW ENDPOINTS ====================

@app.post("/api/reviews", response_model=ReviewResponse, status_code=201)
def create_review(review_data: ReviewCreate, user_id: int, db: Session = Depends(get_db)):
    """Create a new review"""
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify restaurant exists
    restaurant = db.query(Restaurant).filter(Restaurant.id == review_data.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Create review
    new_review = Review(
        user_id=user_id,
        restaurant_id=review_data.restaurant_id,
        order_id=review_data.order_id,
        rating=review_data.rating,
        comment=review_data.comment
    )
    
    db.add(new_review)
    
    # Update restaurant rating
    reviews = db.query(Review).filter(Review.restaurant_id == review_data.restaurant_id).all()
    total_rating = sum(r.rating for r in reviews) + review_data.rating
    total_reviews = len(reviews) + 1
    restaurant.rating = total_rating / total_reviews
    restaurant.total_reviews = total_reviews
    
    db.commit()
    db.refresh(new_review)
    return new_review

@app.get("/api/reviews", response_model=List[ReviewResponse])
def get_reviews(
    restaurant_id: int = None,
    user_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get reviews with optional filters"""
    query = db.query(Review)
    
    if restaurant_id:
        query = query.filter(Review.restaurant_id == restaurant_id)
    if user_id:
        query = query.filter(Review.user_id == user_id)
    
    reviews = query.order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
    return reviews

# ==================== DRIVER ENDPOINTS ====================

@app.post("/api/drivers", response_model=DriverResponse, status_code=201)
def create_driver(driver_data: DriverCreate, user_id: int, db: Session = Depends(get_db)):
    """Create a driver profile"""
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if driver profile already exists
    existing_driver = db.query(Driver).filter(Driver.user_id == user_id).first()
    if existing_driver:
        raise HTTPException(status_code=400, detail="Driver profile already exists")
    
    new_driver = Driver(user_id=user_id, **driver_data.dict())
    db.add(new_driver)
    db.commit()
    db.refresh(new_driver)
    return new_driver

@app.get("/api/drivers", response_model=List[DriverResponse])
def get_drivers(
    is_available: bool = None,
    is_verified: bool = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all drivers with optional filters"""
    query = db.query(Driver)
    
    if is_available is not None:
        query = query.filter(Driver.is_available == is_available)
    if is_verified is not None:
        query = query.filter(Driver.is_verified == is_verified)
    
    drivers = query.offset(skip).limit(limit).all()
    return drivers

@app.get("/api/drivers/{driver_id}", response_model=DriverResponse)
def get_driver(driver_id: int, db: Session = Depends(get_db)):
    """Get driver by ID"""
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

@app.put("/api/drivers/{driver_id}/availability")
def update_driver_availability(driver_id: int, is_available: bool, db: Session = Depends(get_db)):
    """Update driver availability"""
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    driver.is_available = is_available
    db.commit()
    return {"message": "Driver availability updated", "is_available": is_available}

# ==================== STATISTICS ENDPOINTS ====================

@app.get("/api/stats/restaurants/{restaurant_id}")
def get_restaurant_stats(restaurant_id: int, db: Session = Depends(get_db)):
    """Get restaurant statistics"""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    total_orders = db.query(Order).filter(Order.restaurant_id == restaurant_id).count()
    total_revenue = db.query(Order).filter(Order.restaurant_id == restaurant_id).with_entities(
        db.func.sum(Order.subtotal)
    ).scalar() or 0.0
    
    return {
        "restaurant_id": restaurant_id,
        "restaurant_name": restaurant.name,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "rating": restaurant.rating,
        "total_reviews": restaurant.total_reviews
    }

@app.get("/api/stats/users/{user_id}")
def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    """Get user statistics"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    total_orders = db.query(Order).filter(Order.customer_id == user_id).count()
    total_spent = db.query(Order).filter(Order.customer_id == user_id).with_entities(
        db.func.sum(Order.total)
    ).scalar() or 0.0
    
    return {
        "user_id": user_id,
        "user_name": user.name,
        "total_orders": total_orders,
        "total_spent": total_spent
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)