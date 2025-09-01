from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Set, Optional, Any
import json
import uuid
import asyncio
from datetime import datetime

from app.redis_client import redis_client

class ConnectionManager:
    """Manages WebSocket connections for real-time tournament updates"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        
        self.player_connections: Dict[str, str] = {}
        
        self.tournament_rooms: Dict[str, Set[str]] = {}
        
        self.connection_metadata: Dict[str, Dict[str, Any]] = {}
    
    async def connect(self, websocket: WebSocket, player_id: str, tournament_id: Optional[str] = None) -> str:
        """Accept WebSocket connection and register player"""
        await websocket.accept()
        
        connection_id = str(uuid.uuid4())
        
        self.active_connections[connection_id] = websocket
        self.player_connections[player_id] = connection_id
        
        self.connection_metadata[connection_id] = {
            "player_id": player_id,
            "tournament_id": tournament_id,
            "connected_at": datetime.utcnow().isoformat(),
            "last_ping": datetime.utcnow().isoformat()
        }
        
        if tournament_id:
            await self.join_tournament_room(connection_id, tournament_id)
        
        redis_client.set_player_session(player_id, {
            "connection_id": connection_id,
            "tournament_id": tournament_id,
            "status": "connected",
            "connected_at": datetime.utcnow().isoformat()
        })
        
        print(f"✅ Player {player_id} connected (connection: {connection_id})")
        return connection_id
    
    async def disconnect(self, connection_id: str):
        """Handle WebSocket disconnection"""
        if connection_id not in self.active_connections:
            return
        
        metadata = self.connection_metadata.get(connection_id, {})
        player_id = metadata.get("player_id")
        tournament_id = metadata.get("tournament_id")
        
        if tournament_id:
            await self.leave_tournament_room(connection_id, tournament_id)
        
        del self.active_connections[connection_id]
        if player_id and player_id in self.player_connections:
            del self.player_connections[player_id]
        if connection_id in self.connection_metadata:
            del self.connection_metadata[connection_id]
        
        if player_id:
            redis_client.set_player_session(player_id, {
                "status": "disconnected",
                "disconnected_at": datetime.utcnow().isoformat()
            })
        
        print(f"❌ Player {player_id} disconnected (connection: {connection_id})")
    
    async def join_tournament_room(self, connection_id: str, tournament_id: str):
        """Add connection to tournament room for broadcasting"""
        if tournament_id not in self.tournament_rooms:
            self.tournament_rooms[tournament_id] = set()
        
        self.tournament_rooms[tournament_id].add(connection_id)
        
        if connection_id in self.connection_metadata:
            self.connection_metadata[connection_id]["tournament_id"] = tournament_id
        
        metadata = self.connection_metadata.get(connection_id, {})
        player_id = metadata.get("player_id")
        if player_id:
            redis_client.add_player_to_tournament_room(tournament_id, player_id)
        
        print(f"🏟️ Connection {connection_id} joined tournament {tournament_id}")
    
    async def leave_tournament_room(self, connection_id: str, tournament_id: str):
        """Remove connection from tournament room"""
        if tournament_id in self.tournament_rooms:
            self.tournament_rooms[tournament_id].discard(connection_id)
            
            if not self.tournament_rooms[tournament_id]:
                del self.tournament_rooms[tournament_id]
        
        metadata = self.connection_metadata.get(connection_id, {})
        player_id = metadata.get("player_id")
        if player_id:
            redis_client.remove_player_from_tournament_room(tournament_id, player_id)
        
        print(f"🚪 Connection {connection_id} left tournament {tournament_id}")
    
    async def send_personal_message(self, player_id: str, message: Dict[str, Any]):
        """Send message to specific player"""
        connection_id = self.player_connections.get(player_id)
        if not connection_id or connection_id not in self.active_connections:
            return False
        
        websocket = self.active_connections[connection_id]
        try:
            await websocket.send_text(json.dumps(message))
            return True
        except Exception as e:
            print(f"❌ Failed to send personal message to {player_id}: {e}")
            await self.disconnect(connection_id)
            return False
    
    async def broadcast_to_tournament(self, tournament_id: str, message: Dict[str, Any], exclude_player: Optional[str] = None):
        """Broadcast message to all players in tournament"""
        if tournament_id not in self.tournament_rooms:
            return 0
        
        sent_count = 0
        failed_connections = []
        
        for connection_id in self.tournament_rooms[tournament_id].copy():
            if connection_id not in self.active_connections:
                failed_connections.append(connection_id)
                continue
            
            metadata = self.connection_metadata.get(connection_id, {})
            if exclude_player and metadata.get("player_id") == exclude_player:
                continue
            
            websocket = self.active_connections[connection_id]
            try:
                await websocket.send_text(json.dumps(message))
                sent_count += 1
            except Exception as e:
                print(f"❌ Failed to broadcast to connection {connection_id}: {e}")
                failed_connections.append(connection_id)
        
        for connection_id in failed_connections:
            await self.disconnect(connection_id)
        
        print(f"📢 Broadcast to tournament {tournament_id}: {sent_count} recipients")
        return sent_count
    
    async def send_match_update(self, match_id: str, player1_id: str, player2_id: str, update_data: Dict[str, Any]):
        """Send match update to both players in a match"""
        sent_count = 0
        
        if await self.send_personal_message(player1_id, {
            "type": "match_update",
            "match_id": match_id,
            "data": update_data
        }):
            sent_count += 1
        
        if await self.send_personal_message(player2_id, {
            "type": "match_update", 
            "match_id": match_id,
            "data": update_data
        }):
            sent_count += 1
        
        return sent_count
    
    async def handle_ping(self, connection_id: str):
        """Handle ping from client to keep connection alive"""
        if connection_id in self.connection_metadata:
            self.connection_metadata[connection_id]["last_ping"] = datetime.utcnow().isoformat()
        
        if connection_id in self.active_connections:
            websocket = self.active_connections[connection_id]
            try:
                await websocket.send_text(json.dumps({"type": "pong"}))
            except Exception as e:
                print(f"❌ Failed to send pong to {connection_id}: {e}")
                await self.disconnect(connection_id)
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get connection statistics"""
        return {
            "total_connections": len(self.active_connections),
            "tournament_rooms": len(self.tournament_rooms),
            "players_connected": len(self.player_connections),
            "rooms_detail": {
                tournament_id: len(connections) 
                for tournament_id, connections in self.tournament_rooms.items()
            }
        }

connection_manager = ConnectionManager()
