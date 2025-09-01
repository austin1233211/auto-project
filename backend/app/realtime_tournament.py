import asyncio
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from app.models import Tournament, TournamentParticipant, Match, Player
from app.database import SessionLocal
from app.websocket_manager import connection_manager
from app.redis_client import redis_client
from app.combat_engine import CombatEngine
from app.heroes import get_hero_by_id

class RealtimeTournamentManager:
    """Manages real-time tournament progression with simultaneous matches"""
    
    def __init__(self):
        self.combat_engine = CombatEngine()
        self.active_tournaments: Dict[str, Dict[str, Any]] = {}
    
    async def start_tournament(self, tournament_id: str):
        """Start tournament with real-time coordination"""
        db = SessionLocal()
        try:
            tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
            if not tournament or tournament.status != "active":
                return False
            
            participants = db.query(TournamentParticipant).filter(
                TournamentParticipant.tournament_id == tournament_id,
                TournamentParticipant.status == "active"
            ).all()
            
            if len(participants) < 2:
                return False
            
            tournament_state = {
                "tournament_id": tournament_id,
                "status": "active",
                "current_round": 1,
                "participants": [
                    {
                        "player_id": str(p.player_id),
                        "hero_id": p.hero_id,
                        "current_health": p.current_health,
                        "max_health": p.max_health,
                        "status": p.status
                    }
                    for p in participants
                ],
                "started_at": datetime.utcnow().isoformat()
            }
            
            redis_client.set_tournament_state(tournament_id, tournament_state)
            self.active_tournaments[tournament_id] = tournament_state
            
            await connection_manager.broadcast_to_tournament(tournament_id, {
                "type": "tournament_started",
                "data": tournament_state
            })
            
            await self.start_round(tournament_id, 1, db)
            
            return True
            
        finally:
            db.close()
    
    async def start_round(self, tournament_id: str, round_number: int, db: Session):
        """Start a tournament round with simultaneous matches"""
        
        participants = db.query(TournamentParticipant).filter(
            TournamentParticipant.tournament_id == tournament_id,
            TournamentParticipant.status == "active"
        ).all()
        
        if len(participants) < 2:
            await self.end_tournament(tournament_id, db)
            return
        
        matches = await self.generate_round_matches(tournament_id, round_number, participants, db)
        
        tournament_state = self.active_tournaments.get(tournament_id, {})
        tournament_state.update({
            "current_round": round_number,
            "matches": [
                {
                    "id": str(match.id),
                    "player1_id": str(match.player1_id),
                    "player2_id": str(match.player2_id),
                    "status": match.status
                }
                for match in matches
            ]
        })
        
        redis_client.set_tournament_state(tournament_id, tournament_state)
        
        await connection_manager.broadcast_to_tournament(tournament_id, {
            "type": "round_started",
            "round_number": round_number,
            "matches": tournament_state["matches"]
        })
        
        match_tasks = []
        for match in matches:
            task = asyncio.create_task(self.run_match(match, db))
            match_tasks.append(task)
        
        match_results = await asyncio.gather(*match_tasks, return_exceptions=True)
        
        await self.process_round_results(tournament_id, round_number, matches, db)
    
    async def generate_round_matches(
        self, 
        tournament_id: str, 
        round_number: int, 
        participants: List[TournamentParticipant], 
        db: Session
    ) -> List[Match]:
        """Generate matches for a tournament round"""
        
        matches = []
        active_participants = [p for p in participants if p.status == "active"]
        
        import random
        random.shuffle(active_participants)
        
        for i in range(0, len(active_participants) - 1, 2):
            player1 = active_participants[i]
            player2 = active_participants[i + 1]
            
            match = Match(
                tournament_id=tournament_id,
                round_number=round_number,
                match_number=(i // 2) + 1,
                player1_id=player1.player_id,
                player2_id=player2.player_id,
                status="pending"
            )
            
            db.add(match)
            matches.append(match)
        
        if len(active_participants) % 2 == 1:
            bye_participant = active_participants[-1]
            await self.advance_player(bye_participant.player_id, tournament_id, db)
        
        db.commit()
        return matches
    
    async def run_match(self, match: Match, db: Session):
        """Run a single match with real-time updates"""
        
        try:
            match.status = "active"
            match.started_at = datetime.utcnow()
            db.commit()
            
            participant1 = db.query(TournamentParticipant).filter(
                TournamentParticipant.tournament_id == match.tournament_id,
                TournamentParticipant.player_id == match.player1_id
            ).first()
            
            participant2 = db.query(TournamentParticipant).filter(
                TournamentParticipant.tournament_id == match.tournament_id,
                TournamentParticipant.player_id == match.player2_id
            ).first()
            
            if not participant1 or not participant2:
                return None
            
            hero1 = get_hero_by_id(participant1.hero_id)
            hero2 = get_hero_by_id(participant2.hero_id)
            
            if not hero1 or not hero2:
                return None
            
            await connection_manager.send_personal_message(str(match.player1_id), {
                "type": "match_starting",
                "match_id": str(match.id),
                "opponent": {
                    "hero_id": participant2.hero_id,
                    "hero_name": hero2["name"]
                }
            })
            
            await connection_manager.send_personal_message(str(match.player2_id), {
                "type": "match_starting", 
                "match_id": str(match.id),
                "opponent": {
                    "hero_id": participant1.hero_id,
                    "hero_name": hero1["name"]
                }
            })
            
            battle_result = await self.simulate_battle_with_updates(
                match, participant1, participant2, hero1, hero2
            )
            
            match.status = "completed"
            match.completed_at = datetime.utcnow()
            match.winner_id = battle_result["winner_id"]
            match.battle_log = battle_result["battle_log"]
            match.match_duration = battle_result["duration"]
            
            participant1.current_health = battle_result["player1_final_health"]
            participant2.current_health = battle_result["player2_final_health"]
            
            if battle_result["winner_id"] == match.player1_id:
                participant2.status = "eliminated"
            else:
                participant1.status = "eliminated"
            
            db.commit()
            
            await connection_manager.send_personal_message(str(match.player1_id), {
                "type": "match_completed",
                "match_id": str(match.id),
                "result": "win" if battle_result["winner_id"] == match.player1_id else "loss",
                "final_health": battle_result["player1_final_health"]
            })
            
            await connection_manager.send_personal_message(str(match.player2_id), {
                "type": "match_completed",
                "match_id": str(match.id), 
                "result": "win" if battle_result["winner_id"] == match.player2_id else "loss",
                "final_health": battle_result["player2_final_health"]
            })
            
            await connection_manager.broadcast_to_tournament(str(match.tournament_id), {
                "type": "match_result",
                "match_id": str(match.id),
                "winner_id": str(battle_result["winner_id"]),
                "round_number": match.round_number
            }, exclude_player=None)
            
            return battle_result
            
        except Exception as e:
            print(f"Match error: {e}")
            match.status = "error"
            db.commit()
            return None
    
    async def simulate_battle_with_updates(
        self, 
        match: Match, 
        participant1: TournamentParticipant, 
        participant2: TournamentParticipant,
        hero1: Dict[str, Any],
        hero2: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Simulate battle with real-time updates and player stat bonuses"""
        from app.models import PlayerStats
        
        db_session = SessionLocal()
        try:
            player1_stats_record = db_session.query(PlayerStats).filter(
                PlayerStats.player_id == participant1.player_id
            ).first()
            player2_stats_record = db_session.query(PlayerStats).filter(
                PlayerStats.player_id == participant2.player_id
            ).first()
        finally:
            db_session.close()
        
        combat_participant1 = self.combat_engine.initialize_participant(
            str(participant1.player_id), hero1["id"], player1_stats_record
        )
        combat_participant2 = self.combat_engine.initialize_participant(
            str(participant2.player_id), hero2["id"], player2_stats_record
        )
        
        combat_participant1.stats.health = participant1.current_health
        combat_participant1.stats.mana = participant1.current_mana
        combat_participant2.stats.health = participant2.current_health
        combat_participant2.stats.mana = participant2.current_mana
        
        player1_stats = {
            "health": combat_participant1.stats.health,
            "attack": combat_participant1.stats.attack,
            "armor": combat_participant1.stats.armor,
            "speed": combat_participant1.stats.speed
        }
        
        player2_stats = {
            "health": combat_participant2.stats.health,
            "attack": combat_participant2.stats.attack,
            "armor": combat_participant2.stats.armor,
            "speed": combat_participant2.stats.speed
        }
        
        battle_result = await self.combat_engine.simulate_battle(
            hero1_data={
                "id": hero1["id"],
                "name": hero1["name"],
                "stats": player1_stats,
                "abilities": hero1["abilities"]
            },
            hero2_data={
                "id": hero2["id"],
                "name": hero2["name"], 
                "stats": player2_stats,
                "abilities": hero2["abilities"]
            }
        )
        
        battle_result.update({
            "winner_id": match.player1_id if battle_result["winner"] == "player1" else match.player2_id
        })
        
        return battle_result
    
    async def process_round_results(
        self, 
        tournament_id: str, 
        round_number: int, 
        matches: List[Match], 
        db: Session
    ):
        """Process results after all matches in a round complete"""
        
        active_participants = db.query(TournamentParticipant).filter(
            TournamentParticipant.tournament_id == tournament_id,
            TournamentParticipant.status == "active"
        ).count()
        
        if active_participants <= 1:
            await self.end_tournament(tournament_id, db)
            return
        
        await connection_manager.broadcast_to_tournament(tournament_id, {
            "type": "round_completed",
            "round_number": round_number,
            "remaining_players": active_participants
        })
        
        await asyncio.sleep(3)
        
        await self.start_round(tournament_id, round_number + 1, db)
    
    async def end_tournament(self, tournament_id: str, db: Session):
        """End tournament and determine winner with gold rewards"""
        from app.economy import EconomyManager
        from app.models import PlayerStats
        
        participants = db.query(TournamentParticipant).filter(
            TournamentParticipant.tournament_id == tournament_id
        ).order_by(TournamentParticipant.placement.asc()).all()
        
        tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
        if tournament:
            tournament.status = "completed"
            tournament.completed_at = datetime.utcnow()
        
        economy_manager = EconomyManager()
        
        for i, participant in enumerate(participants):
            placement = i + 1 if participant.placement is None else participant.placement
            participant.placement = placement
            
            player_stats = db.query(PlayerStats).filter(
                PlayerStats.player_id == participant.player_id
            ).first()
            
            if player_stats:
                reward = economy_manager.award_tournament_rewards(
                    player_stats, placement, len(participants), tournament.entry_fee or 0
                )
                participant.prize_won = reward["gold_earned"]
        
        db.commit()
        
        winner = participants[0] if participants else None
        
        await connection_manager.broadcast_to_tournament(tournament_id, {
            "type": "tournament_completed",
            "winner": {
                "player_id": str(winner.player_id) if winner else None,
                "hero_id": winner.hero_id if winner else None
            }
        })
        
        if tournament_id in self.active_tournaments:
            del self.active_tournaments[tournament_id]
        
        redis_client.set_tournament_state(tournament_id, {
            "status": "completed",
            "winner_id": str(winner.player_id) if winner else None,
            "completed_at": datetime.utcnow().isoformat()
        })
    
    async def advance_player(self, player_id: str, tournament_id: str, db: Session):
        """Advance player (for bye situations)"""
        
        await connection_manager.send_personal_message(str(player_id), {
            "type": "bye_round",
            "message": "You received a bye this round and advance automatically"
        })

realtime_tournament_manager = RealtimeTournamentManager()
