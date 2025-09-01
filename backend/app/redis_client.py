import redis
import json
import os
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

load_dotenv()

class RedisClient:
    """Redis client for caching tournament and match states"""
    
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis_host = os.getenv("REDIS_HOST", "localhost")
        self.redis_port = int(os.getenv("REDIS_PORT", 6379))
        self.redis_password = os.getenv("REDIS_PASSWORD", None)
        
        try:
            if self.redis_url:
                self.client = redis.from_url(self.redis_url)
            else:
                self.client = redis.Redis(
                    host=self.redis_host,
                    port=self.redis_port,
                    password=self.redis_password,
                    decode_responses=True
                )
            
            self.client.ping()
            print("✅ Redis connection established")
        except redis.ConnectionError:
            print("⚠️ Redis connection failed - using fallback mode")
            self.client = None
    
    def is_connected(self) -> bool:
        """Check if Redis is connected"""
        return self.client is not None
    
    def set_tournament_state(self, tournament_id: str, state: Dict[str, Any], ttl: int = 3600):
        """Cache tournament state with TTL"""
        if not self.client:
            return False
        
        key = f"tournament:{tournament_id}:state"
        try:
            self.client.setex(key, ttl, json.dumps(state))
            return True
        except Exception as e:
            print(f"Redis set error: {e}")
            return False
    
    def get_tournament_state(self, tournament_id: str) -> Optional[Dict[str, Any]]:
        """Get cached tournament state"""
        if not self.client:
            return None
        
        key = f"tournament:{tournament_id}:state"
        try:
            data = self.client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            print(f"Redis get error: {e}")
            return None
    
    def update_tournament_bracket(self, tournament_id: str, bracket_data: Dict[str, Any]):
        """Update tournament bracket in cache"""
        key = f"tournament:{tournament_id}:bracket"
        if self.client:
            try:
                self.client.setex(key, 3600, json.dumps(bracket_data))
                return True
            except Exception as e:
                print(f"Redis bracket update error: {e}")
        return False
    
    def get_tournament_bracket(self, tournament_id: str) -> Optional[Dict[str, Any]]:
        """Get tournament bracket from cache"""
        if not self.client:
            return None
        
        key = f"tournament:{tournament_id}:bracket"
        try:
            data = self.client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            print(f"Redis bracket get error: {e}")
            return None
    
    def set_match_state(self, match_id: str, state: Dict[str, Any], ttl: int = 1800):
        """Cache active match state"""
        if not self.client:
            return False
        
        key = f"match:{match_id}:state"
        try:
            self.client.setex(key, ttl, json.dumps(state))
            return True
        except Exception as e:
            print(f"Redis match set error: {e}")
            return False
    
    def get_match_state(self, match_id: str) -> Optional[Dict[str, Any]]:
        """Get cached match state"""
        if not self.client:
            return None
        
        key = f"match:{match_id}:state"
        try:
            data = self.client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            print(f"Redis match get error: {e}")
            return None
    
    def delete_match_state(self, match_id: str):
        """Remove match state after completion"""
        if self.client:
            key = f"match:{match_id}:state"
            try:
                self.client.delete(key)
            except Exception as e:
                print(f"Redis match delete error: {e}")
    
    def set_player_session(self, player_id: str, session_data: Dict[str, Any], ttl: int = 7200):
        """Cache player session data"""
        if not self.client:
            return False
        
        key = f"player:{player_id}:session"
        try:
            self.client.setex(key, ttl, json.dumps(session_data))
            return True
        except Exception as e:
            print(f"Redis session set error: {e}")
            return False
    
    def get_player_session(self, player_id: str) -> Optional[Dict[str, Any]]:
        """Get player session data"""
        if not self.client:
            return None
        
        key = f"player:{player_id}:session"
        try:
            data = self.client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            print(f"Redis session get error: {e}")
            return None
    
    def add_player_to_tournament_room(self, tournament_id: str, player_id: str):
        """Add player to tournament room for broadcasting"""
        if self.client:
            key = f"tournament:{tournament_id}:players"
            try:
                self.client.sadd(key, player_id)
                self.client.expire(key, 7200)  # 2 hour TTL
            except Exception as e:
                print(f"Redis room add error: {e}")
    
    def remove_player_from_tournament_room(self, tournament_id: str, player_id: str):
        """Remove player from tournament room"""
        if self.client:
            key = f"tournament:{tournament_id}:players"
            try:
                self.client.srem(key, player_id)
            except Exception as e:
                print(f"Redis room remove error: {e}")
    
    def get_tournament_room_players(self, tournament_id: str) -> List[str]:
        """Get all players in tournament room"""
        if not self.client:
            return []
        
        key = f"tournament:{tournament_id}:players"
        try:
            return list(self.client.smembers(key))
        except Exception as e:
            print(f"Redis room get error: {e}")
            return []
    
    def publish_tournament_event(self, tournament_id: str, event_data: Dict[str, Any]):
        """Publish tournament event to Redis pub/sub"""
        if self.client:
            channel = f"tournament:{tournament_id}:events"
            try:
                self.client.publish(channel, json.dumps(event_data))
            except Exception as e:
                print(f"Redis publish error: {e}")
    
    def publish_player_event(self, player_id: str, event_data: Dict[str, Any]):
        """Publish player-specific event"""
        if self.client:
            channel = f"player:{player_id}:events"
            try:
                self.client.publish(channel, json.dumps(event_data))
            except Exception as e:
                print(f"Redis player publish error: {e}")

redis_client = RedisClient()
