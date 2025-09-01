from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.database import get_db
from app.models import Player, PlayerStats
from app.schemas import UserResponse, PlayerStatsResponse
from app.auth import get_current_active_user

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_player(current_user: Player = Depends(get_current_active_user)):
    """Get current player information"""
    return current_user

@router.get("/me/stats", response_model=PlayerStatsResponse)
async def get_current_player_stats(
    current_user: Player = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current player's stats"""
    stats = db.query(PlayerStats).filter(PlayerStats.player_id == current_user.id).first()
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player stats not found"
        )
    return stats

@router.get("/{player_id}", response_model=UserResponse)
async def get_player(
    player_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Player = Depends(get_current_active_user)
):
    """Get player information by ID"""
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found"
        )
    return player

@router.get("/{player_id}/stats", response_model=PlayerStatsResponse)
async def get_player_stats(
    player_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Player = Depends(get_current_active_user)
):
    """Get player stats by ID"""
    stats = db.query(PlayerStats).filter(PlayerStats.player_id == player_id).first()
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player stats not found"
        )
    return stats

@router.patch("/me/stats")
async def update_player_stats(
    gold: int = None,
    abilities: List[dict] = None,
    items: List[dict] = None,
    achievements: List[dict] = None,
    preferences: dict = None,
    current_user: Player = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current player's stats"""
    stats = db.query(PlayerStats).filter(PlayerStats.player_id == current_user.id).first()
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player stats not found"
        )
    
    if gold is not None:
        stats.gold = gold
    if abilities is not None:
        stats.abilities = abilities
    if items is not None:
        stats.items = items
    if achievements is not None:
        stats.achievements = achievements
    if preferences is not None:
        stats.preferences = preferences
    
    db.commit()
    db.refresh(stats)
    
    return {"message": "Stats updated successfully", "stats": stats}
