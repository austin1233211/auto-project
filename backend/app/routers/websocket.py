from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
import json
import asyncio

from app.database import get_db
from app.models import Player, Tournament, TournamentParticipant
from app.auth import get_current_user_from_token
from app.websocket_manager import connection_manager
from app.redis_client import redis_client

router = APIRouter()

@router.websocket("/tournament/{tournament_id}")
async def tournament_websocket(
    websocket: WebSocket,
    tournament_id: str,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """WebSocket endpoint for tournament real-time updates"""
    
    try:
        current_user = await get_current_user_from_token(token, db)
        if not current_user:
            await websocket.close(code=4001, reason="Authentication failed")
            return
    except Exception as e:
        await websocket.close(code=4001, reason="Invalid token")
        return
    
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        await websocket.close(code=4004, reason="Tournament not found")
        return
    
    participant = db.query(TournamentParticipant).filter(
        TournamentParticipant.tournament_id == tournament_id,
        TournamentParticipant.player_id == current_user.id
    ).first()
    
    if not participant:
        await websocket.close(code=4003, reason="Not a tournament participant")
        return
    
    connection_id = await connection_manager.connect(
        websocket, 
        str(current_user.id), 
        tournament_id
    )
    
    try:
        await send_tournament_state(websocket, tournament_id, db)
        
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                await handle_websocket_message(
                    connection_id, 
                    message, 
                    current_user.id, 
                    tournament_id, 
                    db
                )
                
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Invalid JSON format"
                }))
            except Exception as e:
                print(f"WebSocket message error: {e}")
                await websocket.send_text(json.dumps({
                    "type": "error", 
                    "message": "Message processing failed"
                }))
    
    except WebSocketDisconnect:
        pass
    finally:
        await connection_manager.disconnect(connection_id)

@router.websocket("/player")
async def player_websocket(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """WebSocket endpoint for player-specific updates"""
    
    try:
        current_user = await get_current_user_from_token(token, db)
        if not current_user:
            await websocket.close(code=4001, reason="Authentication failed")
            return
    except Exception as e:
        await websocket.close(code=4001, reason="Invalid token")
        return
    
    connection_id = await connection_manager.connect(
        websocket,
        str(current_user.id)
    )
    
    try:
        await send_player_state(websocket, current_user.id, db)
        
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                await handle_player_message(
                    connection_id,
                    message,
                    current_user.id,
                    db
                )
                
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Invalid JSON format"
                }))
            except Exception as e:
                print(f"Player WebSocket error: {e}")
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Message processing failed"
                }))
    
    except WebSocketDisconnect:
        pass
    finally:
        await connection_manager.disconnect(connection_id)

async def send_tournament_state(websocket: WebSocket, tournament_id: str, db: Session):
    """Send current tournament state to client"""
    
    cached_state = redis_client.get_tournament_state(tournament_id)
    if cached_state:
        await websocket.send_text(json.dumps({
            "type": "tournament_state",
            "data": cached_state
        }))
        return
    
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        return
    
    participants = db.query(TournamentParticipant).filter(
        TournamentParticipant.tournament_id == tournament_id
    ).all()
    
    tournament_state = {
        "tournament": {
            "id": str(tournament.id),
            "name": tournament.name,
            "status": tournament.status,
            "current_players": tournament.current_players,
            "max_players": tournament.max_players,
            "created_at": tournament.created_at.isoformat() if tournament.created_at else None,
            "started_at": tournament.started_at.isoformat() if tournament.started_at else None
        },
        "participants": [
            {
                "player_id": str(p.player_id),
                "hero_id": p.hero_id,
                "current_health": p.current_health,
                "max_health": p.max_health,
                "status": p.status,
                "placement": p.placement
            }
            for p in participants
        ]
    }
    
    redis_client.set_tournament_state(tournament_id, tournament_state)
    
    await websocket.send_text(json.dumps({
        "type": "tournament_state",
        "data": tournament_state
    }))

async def send_player_state(websocket: WebSocket, player_id: str, db: Session):
    """Send current player state to client"""
    
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        return
    
    active_tournaments = db.query(Tournament).join(TournamentParticipant).filter(
        TournamentParticipant.player_id == player_id,
        Tournament.status.in_(["waiting", "active"])
    ).all()
    
    player_state = {
        "player": {
            "id": str(player.id),
            "username": player.username,
            "email": player.email
        },
        "active_tournaments": [
            {
                "id": str(t.id),
                "name": t.name,
                "status": t.status,
                "current_players": t.current_players,
                "max_players": t.max_players
            }
            for t in active_tournaments
        ]
    }
    
    await websocket.send_text(json.dumps({
        "type": "player_state",
        "data": player_state
    }))

async def handle_websocket_message(
    connection_id: str, 
    message: dict, 
    player_id: str, 
    tournament_id: str, 
    db: Session
):
    """Handle incoming WebSocket messages for tournament"""
    
    message_type = message.get("type")
    
    if message_type == "ping":
        await connection_manager.handle_ping(connection_id)
    
    elif message_type == "request_bracket":
        bracket_data = redis_client.get_tournament_bracket(tournament_id)
        if bracket_data:
            await connection_manager.send_personal_message(player_id, {
                "type": "tournament_bracket",
                "data": bracket_data
            })
    
    elif message_type == "ready_for_match":
        await handle_player_ready(player_id, tournament_id, db)
    
    else:
        print(f"Unknown message type: {message_type}")

async def handle_player_message(
    connection_id: str,
    message: dict,
    player_id: str,
    db: Session
):
    """Handle incoming WebSocket messages for player"""
    
    message_type = message.get("type")
    
    if message_type == "ping":
        await connection_manager.handle_ping(connection_id)
    
    elif message_type == "join_tournament":
        tournament_id = message.get("tournament_id")
        if tournament_id:
            await connection_manager.join_tournament_room(connection_id, tournament_id)
    
    elif message_type == "leave_tournament":
        tournament_id = message.get("tournament_id")
        if tournament_id:
            await connection_manager.leave_tournament_room(connection_id, tournament_id)
    
    else:
        print(f"Unknown player message type: {message_type}")

async def handle_player_ready(player_id: str, tournament_id: str, db: Session):
    """Handle player ready signal for match"""
    
    redis_client.set_player_session(player_id, {
        "status": "ready_for_match",
        "tournament_id": tournament_id,
        "ready_at": asyncio.get_event_loop().time()
    })
    
    await connection_manager.broadcast_to_tournament(tournament_id, {
        "type": "player_ready",
        "player_id": player_id
    })

@router.get("/stats")
async def websocket_stats():
    """Get WebSocket connection statistics"""
    return {
        "connections": connection_manager.get_connection_stats(),
        "redis_connected": redis_client.is_connected()
    }
