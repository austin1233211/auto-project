from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
import uuid

from app.database import get_db
from app.models import Tournament, TournamentParticipant, Player
from app.schemas import (
    TournamentCreate, 
    TournamentResponse, 
    TournamentJoin,
    TournamentParticipantResponse
)
from app.auth import get_current_active_user
from app.heroes import get_hero_by_id

router = APIRouter()

@router.post("/", response_model=TournamentResponse, status_code=status.HTTP_201_CREATED)
async def create_tournament(
    tournament: TournamentCreate,
    db: Session = Depends(get_db),
    current_user: Player = Depends(get_current_active_user)
):
    """Create a new tournament"""
    db_tournament = Tournament(
        name=tournament.name,
        max_players=tournament.max_players,
        entry_fee=tournament.entry_fee,
        tournament_type=tournament.tournament_type,
        prize_pool=tournament.entry_fee * tournament.max_players
    )
    
    db.add(db_tournament)
    db.commit()
    db.refresh(db_tournament)
    
    return db_tournament

@router.get("/", response_model=List[TournamentResponse])
async def list_tournaments(
    status_filter: str = None,
    db: Session = Depends(get_db),
    current_user: Player = Depends(get_current_active_user)
):
    """List all tournaments, optionally filtered by status"""
    query = db.query(Tournament)
    
    if status_filter:
        query = query.filter(Tournament.status == status_filter)
    
    tournaments = query.order_by(Tournament.created_at.desc()).all()
    return tournaments

@router.get("/{tournament_id}", response_model=TournamentResponse)
async def get_tournament(
    tournament_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Player = Depends(get_current_active_user)
):
    """Get tournament details"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    return tournament

@router.post("/{tournament_id}/join", response_model=TournamentParticipantResponse)
async def join_tournament(
    tournament_id: uuid.UUID,
    join_data: TournamentJoin,
    db: Session = Depends(get_db),
    current_user: Player = Depends(get_current_active_user)
):
    """Join a tournament with selected hero"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    if tournament.status != "waiting":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament is not accepting new players"
        )
    
    if tournament.current_players >= tournament.max_players:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament is full"
        )
    
    existing_participant = db.query(TournamentParticipant).filter(
        and_(
            TournamentParticipant.tournament_id == tournament_id,
            TournamentParticipant.player_id == current_user.id
        )
    ).first()
    
    if existing_participant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already joined this tournament"
        )
    
    hero = get_hero_by_id(join_data.hero_id)
    if not hero:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid hero selection"
        )
    
    participant = TournamentParticipant(
        tournament_id=tournament_id,
        player_id=current_user.id,
        hero_id=join_data.hero_id,
        current_health=hero["stats"]["health"],
        max_health=hero["stats"]["health"]
    )
    
    db.add(participant)
    
    tournament.current_players += 1
    
    if tournament.current_players >= tournament.max_players:
        tournament.status = "active"
    
    db.commit()
    db.refresh(participant)
    
    return participant

@router.get("/{tournament_id}/participants", response_model=List[TournamentParticipantResponse])
async def get_tournament_participants(
    tournament_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Player = Depends(get_current_active_user)
):
    """Get all participants in a tournament"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    participants = db.query(TournamentParticipant).filter(
        TournamentParticipant.tournament_id == tournament_id
    ).all()
    
    return participants

@router.delete("/{tournament_id}/leave")
async def leave_tournament(
    tournament_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Player = Depends(get_current_active_user)
):
    """Leave a tournament (only if not started)"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    if tournament.status != "waiting":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot leave tournament that has already started"
        )
    
    participant = db.query(TournamentParticipant).filter(
        and_(
            TournamentParticipant.tournament_id == tournament_id,
            TournamentParticipant.player_id == current_user.id
        )
    ).first()
    
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not participating in this tournament"
        )
    
    db.delete(participant)
    tournament.current_players -= 1
    
    db.commit()
    
    return {"message": "Successfully left tournament"}
