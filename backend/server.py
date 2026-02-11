from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import secrets
import shutil
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, date
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Simple Admin Auth
security = HTTPBasic()
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'syncbridge325')

def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    if not correct_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return True

# Mission Configuration
MISSION_START_DATE = date(2026, 2, 22)
MISSION_TOTAL_DAYS = 325

# Merchandise Configuration (Default products - can be overridden by DB)
DEFAULT_MERCHANDISE = {
    "hoodie": {"name": "Guardian Hoodie", "price": 65.00, "description": "Premium black hoodie with sacred geometry logo and your personalized Scroll ID", "sizes": ["S", "M", "L", "XL", "XXL"]},
    "shirt": {"name": "Guardian T-Shirt", "price": 35.00, "description": "Classic black t-shirt with sacred geometry logo and your personalized Scroll ID", "sizes": ["S", "M", "L", "XL", "XXL"]},
    "hat": {"name": "Guardian Cap", "price": 30.00, "description": "Black fitted cap with sacred geometry logo and your personalized Scroll ID", "sizes": None}
}

# ============ MODELS ============

class GuardianCreate(BaseModel):
    email: EmailStr
    password: str

class GuardianLogin(BaseModel):
    scroll_id: str
    password: str

class Guardian(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    scroll_id: str
    password_hash: str
    registered_at: str
    is_certified: bool = True

class GuardianResponse(BaseModel):
    id: str
    email: str
    scroll_id: str
    registered_at: str
    is_certified: bool

class TransmissionCreate(BaseModel):
    title: str
    description: str
    video_url: Optional[str] = None
    day_number: int

class Transmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    video_url: Optional[str] = None
    day_number: int
    created_at: str

class MissionStatus(BaseModel):
    current_day: int
    total_days: int
    days_remaining: int
    mission_start: str
    mission_end: str
    progress_percent: float
    is_active: bool

# Merchandise Models
class OrderItem(BaseModel):
    product_type: str  # hoodie, shirt, hat
    size: Optional[str] = None  # S, M, L, XL, XXL (not needed for hat)
    quantity: int = 1

class OrderCreate(BaseModel):
    scroll_id: str
    email: EmailStr
    items: List[OrderItem]
    shipping_name: str
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_zip: str
    shipping_country: str = "USA"
    notes: Optional[str] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    scroll_id: str
    email: str
    items: List[dict]
    total_amount: float
    shipping_name: str
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_zip: str
    shipping_country: str
    notes: Optional[str] = None
    status: str = "pending"
    created_at: str

# Product Models
class ProductCreate(BaseModel):
    product_type: str  # unique identifier like "hoodie", "shirt", "mug"
    name: str
    price: float
    description: str
    sizes: Optional[List[str]] = None  # None for items without sizes
    image_type: str = "hoodie"  # hoodie, shirt, hat for preview rendering
    image_url: Optional[str] = None  # URL to product image

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_type: str
    name: str
    price: float
    description: str
    sizes: Optional[List[str]] = None
    image_type: str = "hoodie"
    image_url: Optional[str] = None
    created_at: str
    is_active: bool = True

# Comment Models
class CommentCreate(BaseModel):
    transmission_id: str
    scroll_id: str
    content: str
    parent_id: Optional[str] = None  # For replies

class Comment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    transmission_id: str
    scroll_id: str
    content: str
    parent_id: Optional[str] = None
    created_at: str
    is_deleted: bool = False

# ============ HELPER FUNCTIONS ============

async def generate_scroll_id() -> str:
    """Generate unique Scroll ID in format SB-XXXX"""
    count = await db.guardians.count_documents({})
    scroll_number = count + 1
    return f"SB-{scroll_number:04d}"

def get_mission_status() -> MissionStatus:
    """Calculate current mission day and status"""
    today = date.today()
    mission_end = date(2026, 2, 22)  # Day 1 is Feb 22, 2026
    
    # Calculate days from start
    if today < MISSION_START_DATE:
        # Before mission starts
        days_until_start = (MISSION_START_DATE - today).days
        return MissionStatus(
            current_day=0,
            total_days=MISSION_TOTAL_DAYS,
            days_remaining=MISSION_TOTAL_DAYS,
            mission_start=MISSION_START_DATE.isoformat(),
            mission_end=(MISSION_START_DATE.replace(year=MISSION_START_DATE.year) + 
                        __import__('datetime').timedelta(days=MISSION_TOTAL_DAYS-1)).isoformat(),
            progress_percent=0.0,
            is_active=False
        )
    
    days_elapsed = (today - MISSION_START_DATE).days + 1
    
    if days_elapsed > MISSION_TOTAL_DAYS:
        days_elapsed = MISSION_TOTAL_DAYS
    
    days_remaining = max(0, MISSION_TOTAL_DAYS - days_elapsed)
    progress = min(100.0, (days_elapsed / MISSION_TOTAL_DAYS) * 100)
    
    from datetime import timedelta
    mission_end_date = MISSION_START_DATE + timedelta(days=MISSION_TOTAL_DAYS - 1)
    
    return MissionStatus(
        current_day=days_elapsed,
        total_days=MISSION_TOTAL_DAYS,
        days_remaining=days_remaining,
        mission_start=MISSION_START_DATE.isoformat(),
        mission_end=mission_end_date.isoformat(),
        progress_percent=round(progress, 2),
        is_active=0 < days_elapsed <= MISSION_TOTAL_DAYS
    )

# ============ ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "TheSyncBridge API - Welcome Guardian"}

@api_router.get("/mission/status", response_model=MissionStatus)
async def get_mission_status_endpoint():
    """Get current mission status and day count"""
    return get_mission_status()

@api_router.post("/guardians/register", response_model=GuardianResponse)
async def register_guardian(guardian_data: GuardianCreate):
    """Register a new Blue Guardian and generate Scroll ID"""
    # Validate password
    if len(guardian_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Check if email already registered
    existing = await db.guardians.find_one(
        {"email": guardian_data.email.lower()},
        {"_id": 0}
    )
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered. Please login instead.")
    
    # Generate unique Scroll ID
    scroll_id = await generate_scroll_id()
    
    # Hash password
    password_hash = bcrypt.hashpw(guardian_data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    guardian = Guardian(
        email=guardian_data.email.lower(),
        scroll_id=scroll_id,
        password_hash=password_hash,
        registered_at=datetime.now(timezone.utc).isoformat(),
        is_certified=True
    )
    
    doc = guardian.model_dump()
    await db.guardians.insert_one(doc)
    
    return GuardianResponse(
        id=guardian.id,
        email=guardian.email,
        scroll_id=guardian.scroll_id,
        registered_at=guardian.registered_at,
        is_certified=guardian.is_certified
    )

@api_router.post("/guardians/login", response_model=GuardianResponse)
async def login_guardian(login_data: GuardianLogin):
    """Login a guardian with Scroll ID and password"""
    guardian = await db.guardians.find_one(
        {"scroll_id": login_data.scroll_id.upper()},
        {"_id": 0}
    )
    if not guardian:
        raise HTTPException(status_code=401, detail="Invalid Scroll ID or password")
    
    # Verify password
    if not bcrypt.checkpw(login_data.password.encode('utf-8'), guardian.get('password_hash', '').encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid Scroll ID or password")
    
    return GuardianResponse(**{k: v for k, v in guardian.items() if k != 'password_hash'})

@api_router.get("/guardians/lookup")
async def lookup_guardian(email: str):
    """Look up a guardian by email"""
    guardian = await db.guardians.find_one(
        {"email": email.lower()},
        {"_id": 0}
    )
    if not guardian:
        raise HTTPException(status_code=404, detail="Guardian not found")
    return GuardianResponse(**guardian)

@api_router.get("/guardians/registry", response_model=List[GuardianResponse])
async def get_guardian_registry():
    """Get list of all registered guardians"""
    guardians = await db.guardians.find({}, {"_id": 0}).to_list(1000)
    return [GuardianResponse(**g) for g in guardians]

@api_router.get("/guardians/count")
async def get_guardian_count():
    """Get total number of registered guardians"""
    count = await db.guardians.count_documents({})
    return {"count": count}

@api_router.get("/guardians/{scroll_id}", response_model=GuardianResponse)
async def get_guardian_by_scroll_id(scroll_id: str):
    """Get guardian by Scroll ID"""
    guardian = await db.guardians.find_one(
        {"scroll_id": scroll_id.upper()},
        {"_id": 0}
    )
    if not guardian:
        raise HTTPException(status_code=404, detail="Guardian not found")
    return GuardianResponse(**guardian)

@api_router.get("/certificate/{scroll_id}")
async def get_certificate(scroll_id: str):
    """Get certificate data for a guardian"""
    guardian = await db.guardians.find_one(
        {"scroll_id": scroll_id.upper()},
        {"_id": 0}
    )
    if not guardian:
        raise HTTPException(status_code=404, detail="Guardian not found")
    
    return {
        "scroll_id": guardian["scroll_id"],
        "registered_at": guardian["registered_at"],
        "is_certified": guardian["is_certified"],
        "certificate_title": "Certificate of Guardianship",
        "organization": "TheSyncBridge",
        "mission": "325-Day Crossing"
    }

# ============ TRANSMISSIONS ============

@api_router.post("/transmissions", response_model=Transmission)
async def create_transmission(transmission_data: TransmissionCreate, admin: bool = Depends(verify_admin)):
    """Create a new transmission (Admin only)"""
    transmission = Transmission(
        title=transmission_data.title,
        description=transmission_data.description,
        video_url=transmission_data.video_url,
        day_number=transmission_data.day_number,
        created_at=datetime.now(timezone.utc).isoformat()
    )
    
    doc = transmission.model_dump()
    await db.transmissions.insert_one(doc)
    
    return transmission

@api_router.get("/transmissions", response_model=List[Transmission])
async def get_transmissions():
    """Get all transmissions"""
    transmissions = await db.transmissions.find(
        {}, {"_id": 0}
    ).sort("day_number", -1).to_list(100)
    return [Transmission(**t) for t in transmissions]

@api_router.get("/transmissions/latest")
async def get_latest_transmission():
    """Get the latest transmission"""
    transmission = await db.transmissions.find_one(
        {}, {"_id": 0},
        sort=[("day_number", -1)]
    )
    if not transmission:
        return None
    return Transmission(**transmission)

@api_router.delete("/transmissions/{transmission_id}")
async def delete_transmission(transmission_id: str, admin: bool = Depends(verify_admin)):
    """Delete a transmission (Admin only)"""
    result = await db.transmissions.delete_one({"id": transmission_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transmission not found")
    return {"message": "Transmission deleted successfully"}

# ============ ADMIN AUTH ============

@api_router.post("/admin/login")
async def admin_login(credentials: HTTPBasicCredentials = Depends(security)):
    """Verify admin credentials"""
    if secrets.compare_digest(credentials.password, ADMIN_PASSWORD):
        return {"message": "Login successful", "authenticated": True}
    raise HTTPException(status_code=401, detail="Invalid credentials")

# ============ MERCHANDISE ============

@api_router.get("/merchandise")
async def get_merchandise():
    """Get all available merchandise"""
    products = await db.products.find({"is_active": True}, {"_id": 0}).to_list(100)
    if not products:
        # Return default products if none in DB
        return DEFAULT_MERCHANDISE
    
    # Convert to dict format and merge with defaults
    db_products = {p["product_type"]: p for p in products}
    
    # Ensure all default products are available
    result = {}
    for product_type, default_product in DEFAULT_MERCHANDISE.items():
        if product_type in db_products:
            result[product_type] = db_products[product_type]
        else:
            result[product_type] = default_product
    
    return result

@api_router.get("/merchandise/list")
async def get_merchandise_list():
    """Get all merchandise as list (for admin)"""
    products = await db.products.find({}, {"_id": 0}).to_list(100)
    return products

@api_router.post("/merchandise", response_model=Product)
async def create_product(product_data: ProductCreate, admin: bool = Depends(verify_admin)):
    """Create a new product (Admin only)"""
    # Check if product_type already exists
    existing = await db.products.find_one({"product_type": product_data.product_type})
    if existing:
        raise HTTPException(status_code=400, detail="Product type already exists")
    
    product = Product(
        product_type=product_data.product_type,
        name=product_data.name,
        price=product_data.price,
        description=product_data.description,
        sizes=product_data.sizes,
        image_type=product_data.image_type,
        image_url=product_data.image_url,
        created_at=datetime.now(timezone.utc).isoformat(),
        is_active=True
    )
    
    doc = product.model_dump()
    await db.products.insert_one(doc)
    return product

@api_router.delete("/merchandise/{product_id}")
async def delete_product(product_id: str, admin: bool = Depends(verify_admin)):
    """Delete a product (Admin only)"""
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

@api_router.get("/merchandise/{product_type}")
async def get_merchandise_item(product_type: str):
    """Get specific merchandise item"""
    product = await db.products.find_one({"product_type": product_type, "is_active": True}, {"_id": 0})
    if not product:
        if product_type in DEFAULT_MERCHANDISE:
            return {product_type: DEFAULT_MERCHANDISE[product_type]}
        raise HTTPException(status_code=404, detail="Product not found")
    return {product_type: product}

# ============ ORDERS ============

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate):
    """Create a new merchandise order"""
    # Verify guardian exists
    guardian = await db.guardians.find_one(
        {"scroll_id": order_data.scroll_id.upper()},
        {"_id": 0}
    )
    if not guardian:
        raise HTTPException(status_code=404, detail="Guardian not found. Please register first.")
    
    # Get available merchandise
    products = await db.products.find({"is_active": True}, {"_id": 0}).to_list(100)
    if not products:
        # Use default products if none in DB
        merchandise = DEFAULT_MERCHANDISE
    else:
        # Convert to dict format and merge with defaults
        db_products = {p["product_type"]: p for p in products}
        
        # Ensure all default products are available
        merchandise = {}
        for product_type, default_product in DEFAULT_MERCHANDISE.items():
            if product_type in db_products:
                merchandise[product_type] = db_products[product_type]
            else:
                merchandise[product_type] = default_product
    
    # Calculate total
    total = 0.0
    items_with_details = []
    for item in order_data.items:
        if item.product_type not in merchandise:
            raise HTTPException(status_code=400, detail=f"Invalid product: {item.product_type}")
        product = merchandise[item.product_type]
        item_total = product["price"] * item.quantity
        total += item_total
        items_with_details.append({
            "product_type": item.product_type,
            "product_name": product["name"],
            "size": item.size,
            "quantity": item.quantity,
            "price": product["price"],
            "item_total": item_total
        })
    
    order = Order(
        scroll_id=order_data.scroll_id.upper(),
        email=order_data.email,
        items=items_with_details,
        total_amount=total,
        shipping_name=order_data.shipping_name,
        shipping_address=order_data.shipping_address,
        shipping_city=order_data.shipping_city,
        shipping_state=order_data.shipping_state,
        shipping_zip=order_data.shipping_zip,
        shipping_country=order_data.shipping_country,
        notes=order_data.notes,
        status="pending",
        created_at=datetime.now(timezone.utc).isoformat()
    )
    
    doc = order.model_dump()
    await db.orders.insert_one(doc)
    
    return order

@api_router.get("/orders", response_model=List[Order])
async def get_orders(admin: bool = Depends(verify_admin)):
    """Get all orders (Admin only)"""
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [Order(**o) for o in orders]

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str):
    """Get specific order"""
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return Order(**order)

@api_router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, admin: bool = Depends(verify_admin)):
    """Update order status (Admin only)"""
    valid_statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order status updated", "status": status}

@api_router.delete("/orders/{order_id}")
async def delete_order(order_id: str, admin: bool = Depends(verify_admin)):
    """Delete an order (Admin only)"""
    result = await db.orders.delete_one({"id": order_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted successfully"}

# ============ FILE UPLOADS ============

@api_router.post("/upload/image")
async def upload_image(file: UploadFile = File(...), admin: bool = Depends(verify_admin)):
    """Upload an image file (Admin only)"""
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: JPEG, PNG, GIF, WEBP")
    
    # Validate file size (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size: 5MB")
    
    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = UPLOAD_DIR / filename
    
    # Save file
    with open(filepath, "wb") as f:
        f.write(contents)
    
    # Return the URL path
    return {
        "filename": filename,
        "url": f"/uploads/{filename}",
        "size": len(contents)
    }

# ============ COMMENTS ============

@api_router.post("/comments", response_model=Comment)
async def create_comment(comment_data: CommentCreate):
    """Create a new comment on a transmission"""
    # Verify guardian exists
    guardian = await db.guardians.find_one(
        {"scroll_id": comment_data.scroll_id.upper()},
        {"_id": 0}
    )
    if not guardian:
        raise HTTPException(status_code=404, detail="Guardian not found. Please register first.")
    
    # Verify transmission exists
    transmission = await db.transmissions.find_one({"id": comment_data.transmission_id})
    if not transmission:
        raise HTTPException(status_code=404, detail="Transmission not found")
    
    # If it's a reply, verify parent comment exists
    if comment_data.parent_id:
        parent = await db.comments.find_one({"id": comment_data.parent_id, "is_deleted": False})
        if not parent:
            raise HTTPException(status_code=404, detail="Parent comment not found")
    
    comment = Comment(
        transmission_id=comment_data.transmission_id,
        scroll_id=comment_data.scroll_id.upper(),
        content=comment_data.content,
        parent_id=comment_data.parent_id,
        created_at=datetime.now(timezone.utc).isoformat(),
        is_deleted=False
    )
    
    doc = comment.model_dump()
    await db.comments.insert_one(doc)
    return comment

@api_router.get("/comments/{transmission_id}")
async def get_comments(transmission_id: str):
    """Get all comments for a transmission"""
    comments = await db.comments.find(
        {"transmission_id": transmission_id, "is_deleted": False},
        {"_id": 0}
    ).sort("created_at", 1).to_list(500)
    return comments

@api_router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: str, scroll_id: Optional[str] = None, admin: bool = Depends(verify_admin)):
    """Delete a comment (Admin only via auth, or owner via scroll_id)"""
    # Admin can delete any comment
    result = await db.comments.update_one(
        {"id": comment_id},
        {"$set": {"is_deleted": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": "Comment deleted"}

@api_router.delete("/comments/{comment_id}/user")
async def delete_own_comment(comment_id: str, scroll_id: str):
    """Delete own comment (for guardians)"""
    comment = await db.comments.find_one({"id": comment_id, "is_deleted": False})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment["scroll_id"] != scroll_id.upper():
        raise HTTPException(status_code=403, detail="You can only delete your own comments")
    
    await db.comments.update_one(
        {"id": comment_id},
        {"$set": {"is_deleted": True}}
    )
    return {"message": "Comment deleted"}

@api_router.post("/comments/admin", response_model=Comment)
async def admin_create_comment(comment_data: CommentCreate, admin: bool = Depends(verify_admin)):
    """Admin can post comments as any guardian or as 'ADMIN'"""
    comment = Comment(
        transmission_id=comment_data.transmission_id,
        scroll_id=comment_data.scroll_id.upper() if comment_data.scroll_id else "ADMIN",
        content=comment_data.content,
        parent_id=comment_data.parent_id,
        created_at=datetime.now(timezone.utc).isoformat(),
        is_deleted=False
    )
    
    doc = comment.model_dump()
    await db.comments.insert_one(doc)
    return comment

@api_router.get("/comments/all/admin")
async def get_all_comments(admin: bool = Depends(verify_admin)):
    """Get all comments for admin moderation"""
    comments = await db.comments.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return comments

# Include the router in the main app
app.include_router(api_router)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
