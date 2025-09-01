from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import os

from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

JsonType = JSON
UuidType = String(36)

if os.getenv("DATABASE_URL", "").startswith("postgresql"):
    from sqlalchemy.dialects.postgresql import UUID, JSONB
    UuidType = UUID(as_uuid=True)
    JsonType = JSONB

class Player(Base):
    __tablename__ = "players"
    
    id = Column(UuidType, primary_key=True, default=generate_uuid)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    stats = relationship("PlayerStats", back_populates="player", uselist=False)
    tournament_participations = relationship("TournamentParticipant", back_populates="player")

class PlayerStats(Base):
    __tablename__ = "player_stats"
    
    player_id = Column(UuidType, ForeignKey("players.id", ondelete="CASCADE"), primary_key=True)
    gold = Column(Integer, default=100)
    total_wins = Column(Integer, default=0)
    total_losses = Column(Integer, default=0)
    current_season_wins = Column(Integer, default=0)
    current_season_losses = Column(Integer, default=0)
    abilities = Column(JsonType, default=list)
    items = Column(JsonType, default=list)
    achievements = Column(JsonType, default=list)
    preferences = Column(JsonType, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    player = relationship("Player", back_populates="stats")

class Tournament(Base):
    __tablename__ = "tournaments"
    
    id = Column(UuidType, primary_key=True, default=generate_uuid)
    name = Column(String(100), default="Tournament")
    status = Column(String(20), default="waiting", index=True)
    max_players = Column(Integer, default=8)
    current_players = Column(Integer, default=0)
    entry_fee = Column(Integer, default=0)
    prize_pool = Column(Integer, default=0)
    tournament_type = Column(String(20), default="elimination")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    participants = relationship("TournamentParticipant", back_populates="tournament")
    matches = relationship("Match", back_populates="tournament")

class TournamentParticipant(Base):
    __tablename__ = "tournament_participants"
    
    tournament_id = Column(UuidType, ForeignKey("tournaments.id", ondelete="CASCADE"), primary_key=True)
    player_id = Column(UuidType, ForeignKey("players.id", ondelete="CASCADE"), primary_key=True)
    hero_id = Column(String(50), nullable=False)
    current_health = Column(Integer, nullable=False)
    max_health = Column(Integer, nullable=False)
    current_mana = Column(Integer, default=0)
    max_mana = Column(Integer, default=100)
    status = Column(String(20), default="active", index=True)
    placement = Column(Integer)
    prize_won = Column(Integer, default=0)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    
    tournament = relationship("Tournament", back_populates="participants")
    player = relationship("Player", back_populates="tournament_participations")

class Match(Base):
    __tablename__ = "matches"
    
    id = Column(UuidType, primary_key=True, default=generate_uuid)
    tournament_id = Column(UuidType, ForeignKey("tournaments.id", ondelete="CASCADE"), nullable=False, index=True)
    round_number = Column(Integer, nullable=False, index=True)
    match_number = Column(Integer, nullable=False)
    player1_id = Column(UuidType, ForeignKey("players.id", ondelete="CASCADE"), nullable=False)
    player2_id = Column(UuidType, ForeignKey("players.id", ondelete="CASCADE"), nullable=False)
    winner_id = Column(UuidType, ForeignKey("players.id"))
    status = Column(String(20), default="pending", index=True)
    battle_log = Column(JsonType, default=list)
    match_duration = Column(Integer)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    tournament = relationship("Tournament", back_populates="matches")
    player1 = relationship("Player", foreign_keys=[player1_id])
    player2 = relationship("Player", foreign_keys=[player2_id])
    winner = relationship("Player", foreign_keys=[winner_id])
