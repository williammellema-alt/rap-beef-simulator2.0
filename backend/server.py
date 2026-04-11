from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json
import random

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

# Predefined rappers with tiers
RAPPERS = [
    {"name": "Kendrick Lamar", "tier": "S", "default_era": 2015},
    {"name": "Drake", "tier": "S", "default_era": 2018},
    {"name": "Eminem", "tier": "S", "default_era": 2002},
    {"name": "Jay-Z", "tier": "S", "default_era": 2001},
    {"name": "Nas", "tier": "S", "default_era": 1994},
    {"name": "Tupac", "tier": "S", "default_era": 1996},
    {"name": "Biggie", "tier": "S", "default_era": 1994},
    {"name": "Lil Wayne", "tier": "A", "default_era": 2008},
    {"name": "Kanye West", "tier": "A", "default_era": 2010},
    {"name": "J. Cole", "tier": "A", "default_era": 2014},
    {"name": "Travis Scott", "tier": "A", "default_era": 2018},
    {"name": "Future", "tier": "A", "default_era": 2017},
    {"name": "50 Cent", "tier": "A", "default_era": 2003},
    {"name": "Snoop Dogg", "tier": "A", "default_era": 1993},
    {"name": "Ice Cube", "tier": "B", "default_era": 1991},
    {"name": "Pusha T", "tier": "B", "default_era": 2018},
    {"name": "Tyler, The Creator", "tier": "B", "default_era": 2019},
    {"name": "Megan Thee Stallion", "tier": "B", "default_era": 2020},
    {"name": "Nicki Minaj", "tier": "A", "default_era": 2014},
    {"name": "Cardi B", "tier": "B", "default_era": 2018},
    {"name": "21 Savage", "tier": "B", "default_era": 2017},
    {"name": "Metro Boomin", "tier": "B", "default_era": 2016},
    {"name": "Rick Ross", "tier": "B", "default_era": 2010},
    {"name": "Meek Mill", "tier": "B", "default_era": 2015},
    {"name": "Machine Gun Kelly", "tier": "C", "default_era": 2018},
    {"name": "Logic", "tier": "C", "default_era": 2017},
]

ALLY_POOL = [
    {"name": "DJ Akademiks", "power": "Media Manipulation", "impact": 5},
    {"name": "Joe Budden", "power": "Podcast Warfare", "impact": 7},
    {"name": "Charlamagne tha God", "power": "Donkey of the Day", "impact": 8},
    {"name": "Funkmaster Flex", "power": "Bomb Drop Fury", "impact": 6},
    {"name": "Dame Dash", "power": "Industry Insider", "impact": 4},
    {"name": "Suge Knight", "power": "Intimidation Factor", "impact": 9},
    {"name": "Diddy", "power": "Bad Boy Backing", "impact": 7},
    {"name": "Dr. Dre", "power": "Production Power", "impact": 10},
    {"name": "Birdman", "power": "Cash Money Clout", "impact": 5},
]

# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class RapperInfo(BaseModel):
    name: str
    tier: str
    era: int

class BattleRequest(BaseModel):
    rapper1: RapperInfo
    rapper2: RapperInfo
    war_zone: bool = False

class BattleEvent(BaseModel):
    round_number: int
    event_type: str
    description: str
    winner: str
    impact_rapper1: int
    impact_rapper2: int
    ally_intervention: Optional[dict] = None

class DamageReport(BaseModel):
    rapper1_name: str
    rapper1_final_score: int
    rapper1_career_impact: str
    rapper2_name: str
    rapper2_final_score: int
    rapper2_career_impact: str
    overall_winner: str
    summary: str

class BattleResponse(BaseModel):
    battle_id: str
    events: List[BattleEvent]
    damage_report: DamageReport

# Helper functions
def get_tier_value(tier: str) -> int:
    tier_map = {"S": 100, "A": 80, "B": 60, "C": 40, "D": 20}
    return tier_map.get(tier.upper(), 50)

def get_era_bonus(era: int) -> int:
    prime_years = {
        (1990, 1999): 15,
        (2000, 2009): 12,
        (2010, 2019): 10,
        (2020, 2026): 8,
    }
    for (start, end), bonus in prime_years.items():
        if start <= era <= end:
            return bonus
    return 5

# Routes
@api_router.get("/")
async def root():
    return {"message": "Rap Beef Simulator API"}

@api_router.get("/rappers")
async def get_rappers():
    return RAPPERS

@api_router.post("/battle", response_model=BattleResponse)
async def start_battle(request: BattleRequest):
    battle_id = str(uuid.uuid4())
    
    # Get API key
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="LLM API key not configured")
    
    # Initialize LLM
    chat = LlmChat(
        api_key=api_key,
        session_id=f"battle-{battle_id}",
        system_message="""You are a legendary hip-hop battle narrator and judge. You narrate rap beef events with dramatic flair, 
        using authentic hip-hop culture references. You decide winners based on lyrical ability, cultural impact, and era-specific factors.
        Always respond with valid JSON only, no other text."""
    ).with_model("openai", "gpt-5.2")
    
    r1 = request.rapper1
    r2 = request.rapper2
    war_zone = request.war_zone
    
    # Calculate base scores
    r1_base = get_tier_value(r1.tier) + get_era_bonus(r1.era)
    r2_base = get_tier_value(r2.tier) + get_era_bonus(r2.era)
    
    prompt = f"""Generate a 5-round rap beef battle between {r1.name} (Tier: {r1.tier}, Era: {r1.era}, Base Score: {r1_base}) 
    and {r2.name} (Tier: {r2.tier}, Era: {r2.era}, Base Score: {r2_base}).
    
    War Zone Mode: {"ENABLED - Include dramatic ally interventions from hip-hop figures" if war_zone else "DISABLED"}
    
    For each round, create a dramatic event (diss track, interview diss, social media beef, surprise performance, etc.)
    Decide the winner based on their tiers and eras. Higher tier and prime era should generally perform better.
    
    Return ONLY a JSON object with this exact structure:
    {{
        "events": [
            {{
                "round_number": 1,
                "event_type": "Diss Track",
                "description": "Dramatic description of what happened",
                "winner": "{r1.name}" or "{r2.name}",
                "impact_rapper1": -10 to 10 (positive if they won, negative if lost),
                "impact_rapper2": -10 to 10 (positive if they won, negative if lost)
                {"," + '"ally_intervention": {"name": "ally name", "power": "their power", "helped": "rapper name", "impact": 5}' if war_zone else ""}
            }}
        ],
        "damage_report": {{
            "rapper1_name": "{r1.name}",
            "rapper1_final_score": calculated score (0-100),
            "rapper1_career_impact": "Description of career impact",
            "rapper2_name": "{r2.name}",
            "rapper2_final_score": calculated score (0-100),
            "rapper2_career_impact": "Description of career impact",
            "overall_winner": "{r1.name}" or "{r2.name}",
            "summary": "Epic summary of the beef"
        }}
    }}"""
    
    try:
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse the JSON response
        response_text = response.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        battle_data = json.loads(response_text.strip())
        
        events = [BattleEvent(**event) for event in battle_data["events"]]
        damage_report = DamageReport(**battle_data["damage_report"])
        
        # Store battle in DB
        battle_doc = {
            "battle_id": battle_id,
            "rapper1": r1.model_dump(),
            "rapper2": r2.model_dump(),
            "war_zone": war_zone,
            "events": [e.model_dump() for e in events],
            "damage_report": damage_report.model_dump(),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await db.battles.insert_one(battle_doc)
        
        return BattleResponse(
            battle_id=battle_id,
            events=events,
            damage_report=damage_report
        )
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}, Response: {response}")
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        logger.error(f"Battle error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

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
