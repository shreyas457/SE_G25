"""
Seed data script to populate the database with sample data
Run this after the database is created
"""
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User, Restaurant, Category, MenuItem, UserRole
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def seed_database():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(User).first():
            print("Database already seeded!")
            return
        
        print("Seeding database...")
        
        # Create Users
        users = [
            User(
                name="John Customer",
                email="customer@example.com",
                phone="555-0101",
                hashed_password=hash_password("password123"),
                role=UserRole.CUSTOMER
            ),
            User(
                name="Jane Owner",
                email="owner@example.com",
                phone="555-0102",
                hashed_password=hash_password("password123"),
                role=UserRole.RESTAURANT_OWNER
            ),
            User(
                name="Mike Driver",
                email="driver@example.com",
                phone="555-0103",
                hashed_password=hash_password("password123"),
                role=UserRole.DRIVER
            ),
            User(
                name="Sarah Owner",
                email="sarah@example.com",
                phone="555-0104",
                hashed_password=hash_password("password123"),
                role=UserRole.RESTAURANT_OWNER
            )
        ]
        db.add_all(users)
        db.commit()
        print(f"✓ Created {len(users)} users")
        
        # Create Categories
        categories = [
            Category(name="Burgers", description="Juicy burgers and fries", display_order=1),
            Category(name="Pizza", description="Fresh pizza from the oven", display_order=2),
            Category(name="Sushi", description="Fresh sushi and rolls", display_order=3),
            Category(name="Mexican", description="Authentic Mexican cuisine", display_order=4),
            Category(name="Chinese", description="Traditional Chinese food", display_order=5),
            Category(name="Italian", description="Classic Italian dishes", display_order=6),
            Category(name="Desserts", description="Sweet treats", display_order=7),
            Category(name="Drinks", description="Beverages and drinks", display_order=8)
        ]
        db.add_all(categories)
        db.commit()
        print(f"✓ Created {len(categories)} categories")
        
        # Create Restaurants
        restaurants = [
            Restaurant(
                owner_id=2,  # Jane Owner
                name="Burger Palace",
                description="The best burgers in town with fresh ingredients",
                cuisine_type="American",
                phone="555-1001",
                email="info@burgerpalace.com",
                street_address="123 Main St",
                city="New York",
                state="NY",
                zip_code="10001",
                latitude=40.7128,
                longitude=-74.0060,
                delivery_fee=2.99,
                minimum_order=15.0,
                estimated_delivery_time=30,
                opening_time="10:00",
                closing_time="22:00",
                rating=4.5,
                total_reviews=150
            ),
            Restaurant(
                owner_id=2,  # Jane Owner
                name="Pizza Heaven",
                description="Authentic New York style pizza",
                cuisine_type="Italian",
                phone="555-1002",
                email="info@pizzaheaven.com",
                street_address="456 Broadway",
                city="New York",
                state="NY",
                zip_code="10002",
                latitude=40.7282,
                longitude=-73.9942,
                delivery_fee=3.99,
                minimum_order=20.0,
                estimated_delivery_time=35,
                opening_time="11:00",
                closing_time="23:00",
                rating=4.7,
                total_reviews=200
            ),
            Restaurant(
                owner_id=4,  # Sarah Owner
                name="Sushi Master",
                description="Fresh sushi made daily",
                cuisine_type="Japanese",
                phone="555-1003",
                email="info@sushimaster.com",
                street_address="789 Park Ave",
                city="New York",
                state="NY",
                zip_code="10003",
                latitude=40.7589,
                longitude=-73.9851,
                delivery_fee=4.99,
                minimum_order=25.0,
                estimated_delivery_time=40,
                opening_time="12:00",
                closing_time="22:00",
                rating=4.8,
                total_reviews=180
            ),
            Restaurant(
                owner_id=4,  # Sarah Owner
                name="Taco Fiesta",
                description="Authentic Mexican tacos and burritos",
                cuisine_type="Mexican",
                phone="555-1004",
                email="info@tacofiesta.com",
                street_address="321 5th Ave",
                city="New York",
                state="NY",
                zip_code="10004",
                latitude=40.7484,
                longitude=-73.9857,
                delivery_fee=2.49,
                minimum_order=12.0,
                estimated_delivery_time=25,
                opening_time="09:00",
                closing_time="21:00",
                rating=4.6,
                total_reviews=120
            )
        ]
        db.add_all(restaurants)
        db.commit()
        print(f"✓ Created {len(restaurants)} restaurants")
        
        # Create Menu Items for Burger Palace
        burger_items = [
            MenuItem(
                restaurant_id=1,
                category_id=1,
                name="Classic Burger",
                description="Beef patty with lettuce, tomato, and special sauce",
                price=9.99,
                is_available=True,
                preparation_time=15,
                calories=650
            ),
            MenuItem(
                restaurant_id=1,
                category_id=1,
                name="Cheeseburger",
                description="Classic burger with melted cheddar cheese",
                price=10.99,
                is_available=True,
                preparation_time=15,
                calories=720
            ),
            MenuItem(
                restaurant_id=1,
                category_id=1,
                name="Bacon Burger",
                description="Burger topped with crispy bacon strips",
                price=12.99,
                is_available=True,
                preparation_time=18,
                calories=800
            ),
            MenuItem(
                restaurant_id=1,
                category_id=1,
                name="Veggie Burger",
                description="Plant-based patty with fresh veggies",
                price=11.99,
                is_vegetarian=True,
                is_vegan=True,
                is_available=True,
                preparation_time=15,
                calories=450
            ),
            MenuItem(
                restaurant_id=1,
                category_id=8,
                name="Soft Drink",
                description="Choice of Coke, Sprite, or Fanta",
                price=2.99,
                is_available=True,
                preparation_time=2,
                calories=150
            )
        ]
        
        # Create Menu Items for Pizza Heaven
        pizza_items = [
            MenuItem(
                restaurant_id=2,
                category_id=2,
                name="Margherita Pizza",
                description="Fresh mozzarella, tomato sauce, and basil",
                price=14.99,
                is_vegetarian=True,
                is_available=True,
                preparation_time=20,
                calories=800
            ),
            MenuItem(
                restaurant_id=2,
                category_id=2,
                name="Pepperoni Pizza",
                description="Classic pepperoni with mozzarella cheese",
                price=16.99,
                is_available=True,
                preparation_time=20,
                calories=950
            ),
            MenuItem(
                restaurant_id=2,
                category_id=2,
                name="Veggie Supreme",
                description="Mushrooms, peppers, onions, olives, and tomatoes",
                price=15.99,
                is_vegetarian=True,
                is_available=True,
                preparation_time=22,
                calories=750
            ),
            MenuItem(
                restaurant_id=2,
                category_id=2,
                name="Meat Lovers",
                description="Pepperoni, sausage, bacon, and ham",
                price=18.99,
                is_available=True,
                preparation_time=25,
                calories=1200
            )
        ]
        
        # Create Menu Items for Sushi Master
        sushi_items = [
            MenuItem(
                restaurant_id=3,
                category_id=3,
                name="California Roll",
                description="Crab, avocado, and cucumber",
                price=8.99,
                is_available=True,
                preparation_time=10,
                calories=255
            ),
            MenuItem(
                restaurant_id=3,
                category_id=3,
                name="Spicy Tuna Roll",
                description="Fresh tuna with spicy mayo",
                price=10.99,
                spice_level=3,
                is_available=True,
                preparation_time=12,
                calories=290
            ),
            MenuItem(
                restaurant_id=3,
                category_id=3,
                name="Dragon Roll",
                description="Eel, avocado, cucumber topped with avocado",
                price=13.99,
                is_available=True,
                preparation_time=15,
                calories=350
            ),
            MenuItem(
                restaurant_id=3,
                category_id=3,
                name="Vegetable Roll",
                description="Avocado, cucumber, and carrot",
                price=7.99,
                is_vegetarian=True,
                is_vegan=True,
                is_available=True,
                preparation_time=8,
                calories=180
            )
        ]
        
        # Create Menu Items for Taco Fiesta
        taco_items = [
            MenuItem(
                restaurant_id=4,
                category_id=4,
                name="Chicken Tacos",
                description="Three soft tacos with grilled chicken",
                price=9.99,
                is_available=True,
                preparation_time=12,
                calories=450
            ),
            MenuItem(
                restaurant_id=4,
                category_id=4,
                name="Beef Burrito",
                description="Large burrito with seasoned beef and beans",
                price=11.99,
                is_available=True,
                preparation_time=15,
                calories=650
            ),
            MenuItem(
                restaurant_id=4,
                category_id=4,
                name="Veggie Quesadilla",
                description="Cheese quesadilla with peppers and onions",
                price=8.99,
                is_vegetarian=True,
                is_available=True,
                preparation_time=10,
                calories=520
            ),
            MenuItem(
                restaurant_id=4,
                category_id=4,
                name="Carnitas Bowl",
                description="Rice bowl with pulled pork, beans, and salsa",
                price=12.99,
                spice_level=2,
                is_available=True,
                preparation_time=12,
                calories=700
            )
        ]
        
        all_menu_items = burger_items + pizza_items + sushi_items + taco_items
        db.add_all(all_menu_items)
        db.commit()
        print(f"✓ Created {len(all_menu_items)} menu items")
        
        print("\n✅ Database seeded successfully!")
        print("\nSample credentials:")
        print("Customer: customer@example.com / password123")
        print("Owner: owner@example.com / password123")
        print("Driver: driver@example.com / password123")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()