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
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# --- Data ---

RAPPERS: list[dict] = [
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

TIER_VALUES: dict[str, int] = {"S": 100, "A": 80, "B": 60, "C": 40, "D": 20}

ERA_BONUSES: list[tuple[int, int, int]] = [
    (1990, 1999, 15),
    (2000, 2009, 12),
    (2010, 2019, 10),
    (2020, 2026, 8),
]

# --- Models ---

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

class Provocation(BaseModel):
    event_type: str = "Provocation"
    track_name: Optional[str] = None
    description: str
    instigator: str

class BattleEvent(BaseModel):
    round_number: int
    event_type: str
    track_name: Optional[str] = None
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
    provocation: Provocation
    events: List[BattleEvent]
    damage_report: DamageReport

# --- Helpers ---

def get_tier_value(tier: str) -> int:
    return TIER_VALUES.get(tier.upper(), 50)

def get_era_bonus(era: int) -> int:
    for start, end, bonus in ERA_BONUSES:
        if start <= era <= end:
            return bonus
    return 5

def generate_win_pattern(name1: str, name2: str) -> list[str]:
    """Generate a non-alternating, non-uniform random win pattern using secrets."""
    names = [name1, name2]
    while True:
        pattern = [names[secrets.randbelow(2)] for _ in range(5)]
        is_alternating = all(pattern[i] != pattern[i + 1] for i in range(4))
        is_uniform = len(set(pattern)) == 1
        both_win = name1 in pattern and name2 in pattern
        if not is_alternating and not is_uniform and both_win:
            return pattern

def build_battle_prompt(r1: RapperInfo, r2: RapperInfo, war_zone: bool, win_pattern_str: str) -> str:
    r1_base = get_tier_value(r1.tier) + get_era_bonus(r1.era)
    r2_base = get_tier_value(r2.tier) + get_era_bonus(r2.era)
    
    ally_snippet = ""
    if war_zone:
        ally_snippet = ',"ally_intervention": {"name": "ally name", "power": "their power", "helped": "rapper name", "impact": 3}'

    return f"""Generate a 5-round rap beef battle between {r1.name} (Tier: {r1.tier}, Era: {r1.era}, Base Score: {r1_base}) \
and {r2.name} (Tier: {r2.tier}, Era: {r2.era}, Base Score: {r2_base}).

War Zone Mode: {"ENABLED - Include dramatic ally interventions from hip-hop figures" if war_zone else "DISABLED"}

IMPORTANT RULES:
1. Make the battle COMPETITIVE - each rapper should win at least 1-2 rounds. No blowouts!
2. For DISS TRACKS, always include a creative track name in quotes (e.g., "Back to Back", "Ether", "Hit 'Em Up")
3. Event types can be: Diss Track, Interview Diss, Social Media Beef, Surprise Performance, Feature Snub, Award Show Shade, Podcast Attack
4. Impact scores should be close (-5 to 5 range typically). A round winner gets +3 to +7, loser gets -3 to -7
5. The overall winner should only be slightly ahead, reflecting a competitive battle
6. CRITICAL - WINNER PATTERN: The round winners must NOT alternate predictably (not A,B,A,B,A). \
Use this exact winner pattern for the 5 rounds: {win_pattern_str}
Follow it exactly. This ensures unpredictability.

Return ONLY a JSON object with this exact structure:
{{
    "provocation": {{
        "event_type": "Provocation",
        "track_name": "optional creative name if applicable",
        "description": "A dramatic setup explaining WHY this beef started - a chance encounter, stolen beat, subliminal bar, award show snub, interview callout, feature gone wrong, etc. Make it specific and creative. This should feel like the inciting incident.",
        "instigator": "{r1.name}" or "{r2.name}"
    }},
    "events": [
        {{
            "round_number": 1,
            "event_type": "Diss Track",
            "track_name": "Creative Track Title Here",
            "description": "Dramatic description mentioning the track name",
            "winner": "{r1.name}" or "{r2.name}",
            "impact_rapper1": -7 to 7 (positive if they won, negative if lost),
            "impact_rapper2": -7 to 7 (positive if they won, negative if lost){ally_snippet}
        }}
    ],
    "damage_report": {{
        "rapper1_name": "{r1.name}",
        "rapper1_final_score": calculated score (40-100, should be close to rapper2),
        "rapper1_career_impact": "Description of career impact",
        "rapper2_name": "{r2.name}",
        "rapper2_final_score": calculated score (40-100, should be close to rapper1),
        "rapper2_career_impact": "Description of career impact",
        "overall_winner": "{r1.name}" or "{r2.name}",
        "summary": "Epic summary emphasizing how close and competitive the beef was"
    }}
}}"""

def parse_llm_response(response_text: str) -> dict:
    """Strip markdown fences and parse JSON."""
    text = response_text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return json.loads(text.strip())

async def store_battle(battle_id: str, request: BattleRequest, provocation: Provocation, events: list[BattleEvent], damage_report: DamageReport) -> None:
    battle_doc = {
        "battle_id": battle_id,
        "rapper1": request.rapper1.model_dump(),
        "rapper2": request.rapper2.model_dump(),
        "war_zone": request.war_zone,
        "provocation": provocation.model_dump(),
        "events": [e.model_dump() for e in events],
        "damage_report": damage_report.model_dump(),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.battles.insert_one(battle_doc)

# --- Routes ---

@api_router.get("/")
async def root() -> dict:
    return {"message": "Rap Beef Simulator API"}

@api_router.get("/rappers")
async def get_rappers() -> list[dict]:
    return RAPPERS

@api_router.post("/battle", response_model=BattleResponse)
async def start_battle(request: BattleRequest) -> BattleResponse:
    battle_id = str(uuid.uuid4())
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    chat = LlmChat(
        api_key=api_key,
        session_id=f"battle-{battle_id}",
        system_message="You are a legendary hip-hop battle narrator and judge. You narrate rap beef events with dramatic flair, "
        "using authentic hip-hop culture references. You decide winners based on lyrical ability, cultural impact, and era-specific factors. "
        "Always respond with valid JSON only, no other text."
    ).with_model("gemini", "gemini-2.5-pro")
    
    win_pattern = generate_win_pattern(request.rapper1.name, request.rapper2.name)
    win_pattern_str = ", ".join([f"Round {i+1}: {w}" for i, w in enumerate(win_pattern)])
    prompt = build_battle_prompt(request.rapper1, request.rapper2, request.war_zone, win_pattern_str)
    
    try:
        response = await chat.send_message(UserMessage(text=prompt))
        battle_data = parse_llm_response(response)
        
        provocation = Provocation(**battle_data["provocation"])
        events = [BattleEvent(**event) for event in battle_data["events"]]
        damage_report = DamageReport(**battle_data["damage_report"])
        
        await store_battle(battle_id, request, provocation, events, damage_report)
        
        return BattleResponse(
            battle_id=battle_id,
            provocation=provocation,
            events=events,
            damage_report=damage_report
        )
    except json.JSONDecodeError as e:
        logger.error("JSON parse error: %s", e)
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        logger.error("Battle error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate) -> StatusCheck:
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks() -> list[StatusCheck]:
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# --- App Setup ---

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client() -> None:
    client.close()
