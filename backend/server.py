from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, date

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Mission Configuration
MISSION_START_DATE = date(2026, 2, 22)
MISSION_TOTAL_DAYS = 325

# ============ MODELS ============

class GuardianCreate(BaseModel):
    email: EmailStr

class Guardian(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    scroll_id: str
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
    # Check if email already registered
    existing = await db.guardians.find_one(
        {"email": guardian_data.email.lower()},
        {"_id": 0}
    )
    if existing:
        return GuardianResponse(**existing)
    
    # Generate unique Scroll ID
    scroll_id = await generate_scroll_id()
    
    guardian = Guardian(
        email=guardian_data.email.lower(),
        scroll_id=scroll_id,
        registered_at=datetime.now(timezone.utc).isoformat(),
        is_certified=True
    )
    
    doc = guardian.model_dump()
    await db.guardians.insert_one(doc)
    
    return GuardianResponse(**doc)

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
async def create_transmission(transmission_data: TransmissionCreate):
    """Create a new transmission"""
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

# Include the router in the main app
app.include_router(api_router)

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
