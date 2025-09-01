"""Combat engine ported from frontend JavaScript combat system"""

import asyncio
import random
import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from app.heroes import get_hero_by_id

@dataclass
class CombatStats:
    health: int
    max_health: int
    attack: int
    armor: int
    speed: int
    mana: int = 0
    max_mana: int = 100

@dataclass
class CombatParticipant:
    player_id: str
    hero_id: str
    hero_name: str
    stats: CombatStats
    abilities: Dict[str, Any]
    is_alive: bool = True

class CombatEngine:
    """Headless combat engine for multiplayer battles"""
    
    def __init__(self):
        self.battle_log: List[Dict[str, Any]] = []
        self.combat_active = False
        self.start_time = None
        
    def initialize_participant(self, player_id: str, hero_id: str) -> CombatParticipant:
        """Initialize a combat participant from hero data"""
        hero = get_hero_by_id(hero_id)
        if not hero:
            raise ValueError(f"Hero {hero_id} not found")
        
        stats = CombatStats(
            health=hero["stats"]["health"],
            max_health=hero["stats"]["health"],
            attack=hero["stats"]["attack"],
            armor=hero["stats"]["armor"],
            speed=hero["stats"]["speed"]
        )
        
        return CombatParticipant(
            player_id=player_id,
            hero_id=hero_id,
            hero_name=hero["name"],
            stats=stats,
            abilities=hero["abilities"]
        )
    
    def calculate_attack_interval(self, speed: int) -> float:
        """Calculate attack interval based on speed (ported from frontend)"""
        base_interval = 3.0
        speed_factor = speed / 10.0
        return max(0.5, base_interval - speed_factor)
    
    def calculate_damage(self, attacker: CombatParticipant, defender: CombatParticipant) -> int:
        """Calculate damage with armor reduction"""
        base_damage = attacker.stats.attack
        
        armor_reduction = defender.stats.armor / (defender.stats.armor + 100)
        damage = int(base_damage * (1 - armor_reduction))
        
        return max(1, damage)
    
    def process_passive_ability(self, participant: CombatParticipant) -> Dict[str, Any]:
        """Process passive abilities (ported from frontend logic)"""
        passive_name = participant.abilities["passive"]["name"]
        effect = {"type": "passive", "name": passive_name, "effect": None}
        
        if passive_name == "Warrior Training":
            if participant.stats.health < participant.stats.max_health * 0.3:
                effect["effect"] = "damage_reduction_active"
                
        elif passive_name == "Arcane Mastery":
            participant.stats.mana = min(participant.stats.max_mana, participant.stats.mana + 15)
            effect["effect"] = f"mana_generated_+15"
            
        elif passive_name == "Eagle Eye":
            effect["effect"] = "critical_chance_active"
            
        elif passive_name == "Shadow Step":
            effect["effect"] = "dodge_chance_active"
            
        elif passive_name == "Divine Blessing":
            if participant.stats.health < participant.stats.max_health * 0.25:
                heal_amount = 3
                participant.stats.health = min(participant.stats.max_health, participant.stats.health + heal_amount)
                effect["effect"] = f"healed_+{heal_amount}"
                
        elif passive_name == "Dark Aura":
            effect["effect"] = "dark_aura_active"
        
        return effect
    
    def execute_ultimate_ability(self, caster: CombatParticipant, target: CombatParticipant) -> Dict[str, Any]:
        """Execute ultimate ability when mana is full"""
        ultimate_name = caster.abilities["ultimate"]["name"]
        effect = {"type": "ultimate", "name": ultimate_name, "caster": caster.hero_name}
        
        if ultimate_name == "Berserker":
            if caster.stats.health < caster.stats.max_health * 0.5:
                caster.stats.speed += 3
                effect["effect"] = "attack_speed_increased"
            else:
                effect["effect"] = "no_effect_high_hp"
                
        elif ultimate_name == "Fireball":
            damage = int(caster.stats.attack * 1.5)
            target.stats.health -= damage
            effect["effect"] = f"magical_damage_{damage}"
            
        elif ultimate_name == "Multi-Shot":
            total_damage = 0
            for i in range(3):
                damage = self.calculate_damage(caster, target)
                target.stats.health -= damage
                total_damage += damage
            effect["effect"] = f"multi_attack_damage_{total_damage}"
            
        elif ultimate_name == "Backstab":
            damage = int(caster.stats.attack * 2.0)
            target.stats.health -= damage
            effect["effect"] = f"critical_damage_{damage}"
            
        elif ultimate_name == "Holy Strike":
            damage = self.calculate_damage(caster, target)
            target.stats.health -= damage
            heal = int(damage * 0.5)
            caster.stats.health = min(caster.stats.max_health, caster.stats.health + heal)
            effect["effect"] = f"damage_{damage}_heal_{heal}"
            
        elif ultimate_name == "Death Coil":
            if caster.stats.health < caster.stats.max_health * 0.5:
                heal = 30
                caster.stats.health = min(caster.stats.max_health, caster.stats.health + heal)
                effect["effect"] = f"self_heal_{heal}"
            else:
                damage = 35
                target.stats.health -= damage
                effect["effect"] = f"enemy_damage_{damage}"
        
        caster.stats.mana = 0
        return effect
    
    def perform_attack(self, attacker: CombatParticipant, defender: CombatParticipant) -> Dict[str, Any]:
        """Perform a single attack between participants"""
        if defender.abilities["passive"]["name"] == "Shadow Step" and random.random() < 0.15:
            return {
                "type": "attack",
                "attacker": attacker.hero_name,
                "defender": defender.hero_name,
                "result": "dodged",
                "damage": 0
            }
        
        damage = self.calculate_damage(attacker, defender)
        
        if attacker.abilities["passive"]["name"] == "Eagle Eye" and random.random() < 0.2:
            damage = int(damage * 1.5)
            result = "critical"
        else:
            result = "hit"
        
        if (defender.abilities["passive"]["name"] == "Warrior Training" and 
            defender.stats.health < defender.stats.max_health * 0.3):
            damage = int(damage * 0.7)
            result += "_reduced"
        
        defender.stats.health -= damage
        defender.stats.health = max(0, defender.stats.health)
        
        attacker.stats.mana = min(attacker.stats.max_mana, attacker.stats.mana + 10)
        
        if defender.stats.health <= 0:
            defender.is_alive = False
            result += "_defeated"
        
        return {
            "type": "attack",
            "attacker": attacker.hero_name,
            "defender": defender.hero_name,
            "result": result,
            "damage": damage,
            "defender_health": defender.stats.health
        }
    
    async def simulate_battle(self, player1_id: str, hero1_id: str, player2_id: str, hero2_id: str) -> Dict[str, Any]:
        """Simulate a complete battle between two heroes"""
        self.battle_log = []
        self.combat_active = True
        self.start_time = time.time()
        
        participant1 = self.initialize_participant(player1_id, hero1_id)
        participant2 = self.initialize_participant(player2_id, hero2_id)
        
        self.battle_log.append({
            "type": "battle_start",
            "message": f"Battle begins! {participant1.hero_name} vs {participant2.hero_name}",
            "timestamp": time.time()
        })
        
        p1_interval = self.calculate_attack_interval(participant1.stats.speed)
        p2_interval = self.calculate_attack_interval(participant2.stats.speed)
        
        self.battle_log.append({
            "type": "combat_info",
            "message": f"{participant1.hero_name} attacks every {p1_interval:.1f}s | {participant2.hero_name} attacks every {p2_interval:.1f}s",
            "timestamp": time.time()
        })
        
        p1_next_attack = p1_interval
        p2_next_attack = p2_interval
        combat_time = 0.0
        time_step = 0.1  # 100ms simulation steps
        max_combat_time = 60.0  # 60 second timeout
        
        while (participant1.is_alive and participant2.is_alive and 
               combat_time < max_combat_time):
            
            combat_time += time_step
            
            if combat_time % 1.0 < time_step:  # Every second
                p1_passive = self.process_passive_ability(participant1)
                if p1_passive["effect"]:
                    self.battle_log.append({
                        "type": "passive",
                        "participant": participant1.hero_name,
                        "effect": p1_passive,
                        "timestamp": time.time()
                    })
                
                p2_passive = self.process_passive_ability(participant2)
                if p2_passive["effect"]:
                    self.battle_log.append({
                        "type": "passive",
                        "participant": participant2.hero_name,
                        "effect": p2_passive,
                        "timestamp": time.time()
                    })
            
            if combat_time >= p1_next_attack and participant1.is_alive:
                if participant1.stats.mana >= participant1.stats.max_mana:
                    ultimate_effect = self.execute_ultimate_ability(participant1, participant2)
                    self.battle_log.append({
                        "type": "ultimate",
                        "effect": ultimate_effect,
                        "timestamp": time.time()
                    })
                else:
                    attack_result = self.perform_attack(participant1, participant2)
                    self.battle_log.append({
                        "type": "attack",
                        "result": attack_result,
                        "timestamp": time.time()
                    })
                
                p1_next_attack = combat_time + p1_interval
            
            if combat_time >= p2_next_attack and participant2.is_alive:
                if participant2.stats.mana >= participant2.stats.max_mana:
                    ultimate_effect = self.execute_ultimate_ability(participant2, participant1)
                    self.battle_log.append({
                        "type": "ultimate",
                        "effect": ultimate_effect,
                        "timestamp": time.time()
                    })
                else:
                    attack_result = self.perform_attack(participant2, participant1)
                    self.battle_log.append({
                        "type": "attack",
                        "result": attack_result,
                        "timestamp": time.time()
                    })
                
                p2_next_attack = combat_time + p2_interval
            
            await asyncio.sleep(0.001)
        
        if participant1.is_alive and not participant2.is_alive:
            winner_id = player1_id
            winner_name = participant1.hero_name
        elif participant2.is_alive and not participant1.is_alive:
            winner_id = player2_id
            winner_name = participant2.hero_name
        else:
            if participant1.stats.health > participant2.stats.health:
                winner_id = player1_id
                winner_name = participant1.hero_name
            elif participant2.stats.health > participant1.stats.health:
                winner_id = player2_id
                winner_name = participant2.hero_name
            else:
                winner_id = random.choice([player1_id, player2_id])
                winner_name = participant1.hero_name if winner_id == player1_id else participant2.hero_name
        
        battle_duration = time.time() - self.start_time
        
        self.battle_log.append({
            "type": "battle_end",
            "winner": winner_name,
            "duration": battle_duration,
            "timestamp": time.time()
        })
        
        self.combat_active = False
        
        return {
            "winner_id": winner_id,
            "winner_name": winner_name,
            "duration": int(battle_duration),
            "battle_log": self.battle_log,
            "final_stats": {
                player1_id: {
                    "health": participant1.stats.health,
                    "max_health": participant1.stats.max_health
                },
                player2_id: {
                    "health": participant2.stats.health,
                    "max_health": participant2.stats.max_health
                }
            }
        }
