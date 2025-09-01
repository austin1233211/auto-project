"""Economy management system for Auto Gladiators"""

from typing import Dict, Any, List, Optional
from app.models import PlayerStats, TournamentParticipant
from app.shop_items import get_shop_item_by_id

class EconomyManager:
    """Manages the game economy, rewards, and progression"""
    
    def __init__(self):
        self.tournament_rewards = {
            1: {"gold": 200, "bonus_multiplier": 2.0},  # Winner
            2: {"gold": 150, "bonus_multiplier": 1.5},  # Runner-up
            3: {"gold": 100, "bonus_multiplier": 1.2},  # Third place
            4: {"gold": 75, "bonus_multiplier": 1.0},   # Fourth place
            5: {"gold": 50, "bonus_multiplier": 0.8},   # Fifth place
            6: {"gold": 30, "bonus_multiplier": 0.6},   # Sixth place
            7: {"gold": 20, "bonus_multiplier": 0.4},   # Seventh place
            8: {"gold": 10, "bonus_multiplier": 0.2}    # Eighth place
        }
        
        self.base_rewards = {
            "match_win": 25,
            "match_loss": 5,
            "tournament_participation": 10,
            "first_win_of_day": 50,
            "achievement_bonus": 100
        }
        
        self.upgrade_costs = {
            1: 100,  # Level 1 -> 2
            2: 200,  # Level 2 -> 3
            3: 400,  # Level 3 -> 4
            4: 800,  # Level 4 -> 5
            5: 1600  # Level 5 -> MAX
        }
    
    def calculate_tournament_reward(self, placement: int, tournament_size: int = 8, entry_fee: int = 0) -> Dict[str, Any]:
        """Calculate gold reward based on tournament placement"""
        if placement not in self.tournament_rewards:
            placement = min(placement, 8)  # Default to last place if beyond 8th
        
        reward_data = self.tournament_rewards[placement]
        base_gold = reward_data["gold"]
        
        size_multiplier = tournament_size / 8.0
        
        entry_fee_bonus = int((entry_fee * tournament_size * 0.8) / min(3, placement))
        
        total_gold = int(base_gold * size_multiplier) + entry_fee_bonus
        
        bonus_items = []
        if placement == 1:
            bonus_items = [{"id": "victory_token", "name": "Victory Token", "rarity": "legendary"}]
        elif placement == 2:
            bonus_items = [{"id": "silver_medal", "name": "Silver Medal", "rarity": "epic"}]
        elif placement == 3:
            bonus_items = [{"id": "bronze_medal", "name": "Bronze Medal", "rarity": "rare"}]
        
        return {
            "gold_reward": total_gold,
            "bonus_items": bonus_items,
            "placement": placement,
            "bonus_multiplier": reward_data["bonus_multiplier"]
        }
    
    def award_tournament_rewards(self, player_stats: PlayerStats, placement: int, tournament_size: int = 8, entry_fee: int = 0) -> Dict[str, Any]:
        """Award tournament rewards to a player"""
        reward = self.calculate_tournament_reward(placement, tournament_size, entry_fee)
        
        player_stats.gold += reward["gold_reward"]
        
        if reward["bonus_items"]:
            current_items = player_stats.items or []
            for bonus_item in reward["bonus_items"]:
                current_items.append({
                    **bonus_item,
                    "earned_from": "tournament",
                    "earned_at": "2025-09-01T11:08:00Z"
                })
            player_stats.items = current_items
        
        if placement <= 3:  # Top 3 considered "wins"
            player_stats.total_wins += 1
            player_stats.current_season_wins += 1
        else:
            player_stats.total_losses += 1
            player_stats.current_season_losses += 1
        
        return {
            "gold_earned": reward["gold_reward"],
            "items_earned": reward["bonus_items"],
            "new_gold_balance": player_stats.gold,
            "placement": placement
        }
    
    def award_match_reward(self, player_stats: PlayerStats, won: bool, is_first_win_today: bool = False) -> int:
        """Award gold for individual match results"""
        if won:
            gold_earned = self.base_rewards["match_win"]
            if is_first_win_today:
                gold_earned += self.base_rewards["first_win_of_day"]
        else:
            gold_earned = self.base_rewards["match_loss"]
        
        player_stats.gold += gold_earned
        return gold_earned
    
    def check_item_requirements(self, item: Dict[str, Any], player_stats: PlayerStats) -> bool:
        """Check if player meets requirements to purchase an item"""
        requirements = item.get("requirements")
        if not requirements:
            return True
        
        if "min_wins" in requirements:
            if player_stats.total_wins < requirements["min_wins"]:
                return False
        
        if "min_gold_spent" in requirements:
            total_spent = len(player_stats.items or []) * 50  # Rough estimate
            if total_spent < requirements["min_gold_spent"]:
                return False
        
        if "tournament_victories" in requirements:
            achievements = player_stats.achievements or []
            tournament_wins = sum(1 for achievement in achievements if achievement.get("type") == "tournament_victory")
            if tournament_wins < requirements["tournament_victories"]:
                return False
        
        return True
    
    def upgrade_ability(self, player_stats: PlayerStats, ability_id: str, upgrade_type: str) -> Dict[str, Any]:
        """Upgrade a player's ability"""
        abilities = player_stats.abilities or []
        
        ability_to_upgrade = None
        for ability in abilities:
            if ability.get("id") == ability_id:
                ability_to_upgrade = ability
                break
        
        if not ability_to_upgrade:
            ability_to_upgrade = {
                "id": ability_id,
                "upgrades": {
                    "damage": 0,
                    "cooldown": 0,
                    "effect": 0
                }
            }
            abilities.append(ability_to_upgrade)
        
        current_level = ability_to_upgrade["upgrades"].get(upgrade_type, 0)
        
        if current_level >= 5:
            return {
                "success": False,
                "message": f"{upgrade_type.title()} upgrade is already at maximum level",
                "upgraded_ability": ability_to_upgrade
            }
        
        upgrade_cost = self.upgrade_costs.get(current_level + 1, 1600)
        
        if player_stats.gold < upgrade_cost:
            return {
                "success": False,
                "message": f"Insufficient gold. Need {upgrade_cost}, have {player_stats.gold}",
                "upgraded_ability": ability_to_upgrade
            }
        
        player_stats.gold -= upgrade_cost
        ability_to_upgrade["upgrades"][upgrade_type] = current_level + 1
        player_stats.abilities = abilities
        
        return {
            "success": True,
            "message": f"Successfully upgraded {ability_id} {upgrade_type} to level {current_level + 1}",
            "upgraded_ability": ability_to_upgrade,
            "cost": upgrade_cost
        }
    
    def calculate_stat_bonuses(self, player_stats: PlayerStats) -> Dict[str, int]:
        """Calculate total stat bonuses from owned items"""
        bonuses = {
            "health": 0,
            "attack": 0,
            "armor": 0,
            "speed": 0
        }
        
        items = player_stats.items or []
        for item in items:
            effects = item.get("effects", {})
            
            if effects.get("permanent", False):
                bonuses["health"] += effects.get("health_bonus", 0)
                bonuses["attack"] += effects.get("attack_bonus", 0)
                bonuses["armor"] += effects.get("armor_bonus", 0)
                bonuses["speed"] += effects.get("speed_bonus", 0)
        
        return bonuses
    
    def get_player_progression_summary(self, player_stats: PlayerStats) -> Dict[str, Any]:
        """Get a summary of player's progression and economy status"""
        stat_bonuses = self.calculate_stat_bonuses(player_stats)
        
        total_inventory_value = 0
        for item in (player_stats.items or []):
            shop_item = get_shop_item_by_id(item.get("id"))
            if shop_item:
                total_inventory_value += shop_item["price"]
        
        ability_upgrades = {}
        for ability in (player_stats.abilities or []):
            ability_id = ability.get("id")
            upgrades = ability.get("upgrades", {})
            total_level = sum(upgrades.values())
            ability_upgrades[ability_id] = {
                "total_level": total_level,
                "upgrades": upgrades
            }
        
        return {
            "gold": player_stats.gold,
            "total_wins": player_stats.total_wins,
            "total_losses": player_stats.total_losses,
            "win_rate": player_stats.total_wins / max(1, player_stats.total_wins + player_stats.total_losses),
            "stat_bonuses": stat_bonuses,
            "inventory_value": total_inventory_value,
            "items_owned": len(player_stats.items or []),
            "ability_upgrades": ability_upgrades,
            "achievements": len(player_stats.achievements or [])
        }
