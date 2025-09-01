"""Tournament management system for multiplayer coordination"""

import asyncio
import random
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models import Tournament, TournamentParticipant, Match, Player
from app.combat_engine import CombatEngine

class TournamentManager:
    """Manages tournament progression and match coordination"""
    
    def __init__(self, db: Session):
        self.db = db
        self.combat_engine = CombatEngine()
    
    def generate_round_matches(self, tournament_id: str, round_number: int) -> List[Dict[str, Any]]:
        """Generate matches for a tournament round with user priority"""
        participants = self.db.query(TournamentParticipant).filter(
            and_(
                TournamentParticipant.tournament_id == tournament_id,
                TournamentParticipant.status == "active"
            )
        ).all()
        
        if len(participants) < 2:
            return []
        
        shuffled = list(participants)
        random.shuffle(shuffled)
        
        user_participant = None
        for i, participant in enumerate(shuffled):
            player = self.db.query(Player).filter(Player.id == participant.player_id).first()
            if player and player.username.startswith("user_"):  # Identify user players
                user_participant = participant
                if i > 0:
                    shuffled[0], shuffled[i] = shuffled[i], shuffled[0]
                break
        
        matches = []
        for i in range(0, len(shuffled), 2):
            if i + 1 < len(shuffled):
                match_data = {
                    "tournament_id": tournament_id,
                    "round_number": round_number,
                    "match_number": len(matches) + 1,
                    "player1_id": shuffled[i].player_id,
                    "player2_id": shuffled[i + 1].player_id,
                    "player1_hero": shuffled[i].hero_id,
                    "player2_hero": shuffled[i + 1].hero_id
                }
                matches.append(match_data)
        
        return matches
    
    async def process_round_matches(self, tournament_id: str, round_number: int) -> List[Dict[str, Any]]:
        """Process all matches in a round simultaneously"""
        matches_data = self.generate_round_matches(tournament_id, round_number)
        
        if not matches_data:
            return []
        
        db_matches = []
        for match_data in matches_data:
            db_match = Match(
                tournament_id=match_data["tournament_id"],
                round_number=match_data["round_number"],
                match_number=match_data["match_number"],
                player1_id=match_data["player1_id"],
                player2_id=match_data["player2_id"],
                status="active"
            )
            self.db.add(db_match)
            db_matches.append(db_match)
        
        self.db.commit()
        
        match_tasks = []
        for i, match_data in enumerate(matches_data):
            task = self.combat_engine.simulate_battle(
                str(match_data["player1_id"]),
                match_data["player1_hero"],
                str(match_data["player2_id"]),
                match_data["player2_hero"]
            )
            match_tasks.append(task)
        
        match_results = await asyncio.gather(*match_tasks)
        
        for i, result in enumerate(match_results):
            db_match = db_matches[i]
            db_match.winner_id = result["winner_id"]
            db_match.status = "completed"
            db_match.battle_log = result["battle_log"]
            db_match.match_duration = result["duration"]
            
            for player_id, stats in result["final_stats"].items():
                participant = self.db.query(TournamentParticipant).filter(
                    and_(
                        TournamentParticipant.tournament_id == tournament_id,
                        TournamentParticipant.player_id == player_id
                    )
                ).first()
                
                if participant:
                    participant.current_health = stats["health"]
                    if stats["health"] <= 0:
                        participant.status = "eliminated"
        
        self.db.commit()
        
        return match_results
    
    def advance_tournament(self, tournament_id: str) -> Dict[str, Any]:
        """Advance tournament to next round or complete it"""
        tournament = self.db.query(Tournament).filter(Tournament.id == tournament_id).first()
        if not tournament:
            return {"error": "Tournament not found"}
        
        active_participants = self.db.query(TournamentParticipant).filter(
            and_(
                TournamentParticipant.tournament_id == tournament_id,
                TournamentParticipant.status == "active"
            )
        ).count()
        
        if active_participants <= 1:
            tournament.status = "completed"
            
            winner = self.db.query(TournamentParticipant).filter(
                and_(
                    TournamentParticipant.tournament_id == tournament_id,
                    TournamentParticipant.status == "active"
                )
            ).first()
            
            if winner:
                winner.placement = 1
                winner.prize_won = tournament.prize_pool
            
            self.db.commit()
            
            return {
                "status": "completed",
                "winner_id": winner.player_id if winner else None,
                "active_participants": active_participants
            }
        
        else:
            return {
                "status": "continue",
                "active_participants": active_participants,
                "next_round": True
            }
    
    async def run_tournament_round(self, tournament_id: str, round_number: int) -> Dict[str, Any]:
        """Run a complete tournament round"""
        match_results = await self.process_round_matches(tournament_id, round_number)
        
        if not match_results:
            return {"error": "No matches to process"}
        
        advancement = self.advance_tournament(tournament_id)
        
        return {
            "round_number": round_number,
            "matches_completed": len(match_results),
            "match_results": match_results,
            "tournament_status": advancement
        }
