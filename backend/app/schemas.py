from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=30, pattern="^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: uuid.UUID
    username: str
    email: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None

class PlayerStatsResponse(BaseModel):
    player_id: uuid.UUID
    gold: int
    total_wins: int
    total_losses: int
    current_season_wins: int
    current_season_losses: int
    abilities: List[Dict[str, Any]]
    items: List[Dict[str, Any]]
    achievements: List[Dict[str, Any]]
    preferences: Dict[str, Any]
    
    class Config:
        from_attributes = True

class TournamentCreate(BaseModel):
    name: str = Field(default="Tournament", max_length=100)
    max_players: int = Field(default=8, ge=2, le=16)
    entry_fee: int = Field(default=0, ge=0)
    tournament_type: str = Field(default="elimination", pattern="^(elimination|round_robin)$")

class TournamentJoin(BaseModel):
    hero_id: str = Field(..., min_length=1)

class TournamentResponse(BaseModel):
    id: uuid.UUID
    name: str
    status: str
    max_players: int
    current_players: int
    entry_fee: int
    prize_pool: int
    tournament_type: str
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class TournamentParticipantResponse(BaseModel):
    tournament_id: uuid.UUID
    player_id: uuid.UUID
    hero_id: str
    current_health: int
    max_health: int
    current_mana: int
    max_mana: int
    status: str
    placement: Optional[int]
    prize_won: int
    joined_at: datetime
    
    class Config:
        from_attributes = True

class MatchResponse(BaseModel):
    id: uuid.UUID
    tournament_id: uuid.UUID
    round_number: int
    match_number: int
    player1_id: uuid.UUID
    player2_id: uuid.UUID
    winner_id: Optional[uuid.UUID]
    status: str
    battle_log: List[Dict[str, Any]]
    match_duration: Optional[int]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class HeroStats(BaseModel):
    health: int
    attack: int
    armor: int
    speed: int

class HeroAbilities(BaseModel):
    passive: Dict[str, str]  # {name: str, description: str}
    ultimate: Dict[str, str]  # {name: str, description: str}

class Hero(BaseModel):
    id: str
    name: str
    type: str
    avatar: str
    description: str
    stats: HeroStats
    abilities: HeroAbilities

class ShopItem(BaseModel):
    id: str
    name: str
    description: str
    category: str
    price: int
    rarity: str
    effects: Dict[str, Any]
    requirements: Optional[Dict[str, Any]] = None
    max_quantity: Optional[int] = None

class ShopItemResponse(ShopItem):
    available: bool
    owned_quantity: int = 0

class PurchaseRequest(BaseModel):
    item_id: str
    quantity: int = Field(default=1, ge=1)

class PurchaseResponse(BaseModel):
    success: bool
    message: str
    new_gold_balance: int
    item_purchased: ShopItem
    quantity_purchased: int

class PlayerInventoryResponse(BaseModel):
    items: List[Dict[str, Any]]
    abilities: List[Dict[str, Any]]
    total_value: int

class AbilityUpgradeRequest(BaseModel):
    ability_id: str
    upgrade_type: str

class AbilityUpgradeResponse(BaseModel):
    success: bool
    message: str
    new_gold_balance: int
    upgraded_ability: Dict[str, Any]

class TournamentReward(BaseModel):
    placement: int
    gold_reward: int
    bonus_items: List[Dict[str, Any]] = []
    achievements: List[str] = []

class RewardResponse(BaseModel):
    gold_earned: int
    items_earned: List[Dict[str, Any]]
    achievements_earned: List[str]
    new_gold_balance: int
