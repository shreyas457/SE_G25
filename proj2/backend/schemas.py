from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from models import UserRole, OrderStatus

class AddressCreate(BaseModel):
    street: str
    lat: Optional[float] = None
    lon: Optional[float] = None


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER
    restaurant_name: Optional[str] = None,
    address: Optional[AddressCreate] = None,
    license_number: Optional[str] = None,
    vehicle_model: Optional[str] = None,

class UserSignIn(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    role: UserRole

class AddressResponse(BaseModel):
    id: int
    user_id: int
    street_address: str
    city: str
    state: str
    zip_code: str
    latitude: Optional[float]
    longitude: Optional[float]
    is_default: bool
    address_type: Optional[str]
    delivery_instructions: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Restaurant Schemas
class RestaurantResponse(BaseModel):
    id: int
    owner_id: int
    name: str
    description: Optional[str]
    cuisine_type: Optional[str]
    rating: float

    class Config:
        from_attributes = True

# Category Schemas
class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon_url: Optional[str] = None
    display_order: int = 0

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    icon_url: Optional[str]
    display_order: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Menu Item Schemas
class MenuItemCreate(BaseModel):
    restaurant_id: int
    category_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    is_vegetarian: bool = False
    is_vegan: bool = False
    is_gluten_free: bool = False
    spice_level: int = 0
    calories: Optional[int] = None
    preparation_time: Optional[int] = None

class MenuItemResponse(BaseModel):
    id: int
    restaurant_id: int
    category_id: Optional[int]
    name: str
    description: Optional[str]
    price: float
    image_url: Optional[str]
    is_vegetarian: bool
    is_vegan: bool
    is_gluten_free: bool
    spice_level: int
    calories: Optional[int]
    preparation_time: Optional[int]
    is_available: bool
    is_featured: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Order Item Schemas
class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int
    special_instructions: Optional[str] = None

class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    menu_item_id: int
    quantity: int
    price: float
    special_instructions: Optional[str]

    class Config:
        from_attributes = True

# Order Schemas
class OrderCreate(BaseModel):
    restaurant_id: int
    delivery_address: str
    delivery_latitude: Optional[float] = None
    delivery_longitude: Optional[float] = None
    delivery_instructions: Optional[str] = None
    items: List[OrderItemCreate]
    tip: float = 0.0

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    restaurant_id: int
    driver_id: Optional[int]
    order_number: str
    status: OrderStatus
    subtotal: float
    delivery_fee: float
    tax: float
    tip: float
    total: float
    delivery_address: str
    delivery_latitude: Optional[float]
    delivery_longitude: Optional[float]
    delivery_instructions: Optional[str]
    estimated_delivery_time: Optional[datetime]
    actual_delivery_time: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Driver Schemas
class DriverCreate(BaseModel):
    vehicle_type: Optional[str] = None
    vehicle_model: Optional[str] = None
    license_plate: Optional[str] = None

class DriverResponse(BaseModel):
    id: int
    user_id: int
    vehicle_type: Optional[str]
    vehicle_model: Optional[str]
    license_plate: Optional[str]
    is_available: bool
    is_verified: bool
    total_deliveries: int
    rating: float
    total_ratings: int
    created_at: datetime

    class Config:
        from_attributes = True

# Review Schemas
class ReviewCreate(BaseModel):
    restaurant_id: int
    order_id: Optional[int] = None
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    user_id: int
    restaurant_id: int
    order_id: Optional[int]
    rating: int
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True