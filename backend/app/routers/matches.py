from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.database import get_db
from app.models import Match, Tournament, Player
from app.schemas import MatchResponse
from app.auth import get_current_active_user

router = APIRouter()

@router.get("/tournament/{tournament_id}", response_model=List[MatchResponse])
async def get_tournament_matches(
    tournament_id: uuid.UUID,
    round_number: int = None,
    db: Session = Depends(get_db),
    current_user: Player = Depends(get_current_active_user)
):
    """Get all matches for a tournament, optionally filtered by round"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    query = db.query(Match).filter(Match.tournament_id == tournament_id)
    
    if round_number is not None:
        query = query.filter(Match.round_number == round_number)
    
    matches = query.order_by(Match.round_number, Match.match_number).all()
    return matches

@router.get("/{match_id}", response_model=MatchResponse)
async def get_match(
    match_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Player = Depends(get_current_active_user)
):
    """Get match details"""
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found"
        )
    return match

@router.get("/player/{player_id}", response_model=List[MatchResponse])
async def get_player_matches(
    player_id: uuid.UUID,
    tournament_id: uuid.UUID = None,
    db: Session = Depends(get_db),
    current_user: Player = Depends(get_current_active_user)
):
    """Get all matches for a specific player"""
    query = db.query(Match).filter(
        (Match.player1_id == player_id) | (Match.player2_id == player_id)
    )
    
    if tournament_id:
        query = query.filter(Match.tournament_id == tournament_id)
    
    matches = query.order_by(Match.started_at.desc()).all()
    return matches

@router.get("/me/matches", response_model=List[MatchResponse])
async def get_my_matches(
    tournament_id: uuid.UUID = None,
    db: Session = Depends(get_db),
    current_user: Player = Depends(get_current_active_user)
):
    """Get all matches for the current player"""
    query = db.query(Match).filter(
        (Match.player1_id == current_user.id) | (Match.player2_id == current_user.id)
    )
    
    if tournament_id:
        query = query.filter(Match.tournament_id == tournament_id)
    
    matches = query.order_by(Match.started_at.desc()).all()
    return matches
