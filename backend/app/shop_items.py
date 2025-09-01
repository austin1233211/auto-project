"""Shop items data and management for the economy system"""

from typing import List, Dict, Any, Optional

SHOP_ITEMS = [
    {
        "id": "damage_boost_1",
        "name": "Minor Damage Boost",
        "description": "Increases all ability damage by 10%",
        "category": "ability_upgrade",
        "price": 50,
        "rarity": "common",
        "effects": {
            "damage_multiplier": 1.1,
            "applies_to": "all_abilities"
        },
        "requirements": None,
        "max_quantity": 3
    },
    {
        "id": "damage_boost_2",
        "name": "Major Damage Boost",
        "description": "Increases all ability damage by 25%",
        "category": "ability_upgrade",
        "price": 150,
        "rarity": "rare",
        "effects": {
            "damage_multiplier": 1.25,
            "applies_to": "all_abilities"
        },
        "requirements": {"min_wins": 5},
        "max_quantity": 2
    },
    {
        "id": "cooldown_reduction_1",
        "name": "Swift Casting",
        "description": "Reduces ultimate ability cooldown by 15%",
        "category": "ability_upgrade",
        "price": 75,
        "rarity": "common",
        "effects": {
            "cooldown_reduction": 0.15,
            "applies_to": "ultimate"
        },
        "requirements": None,
        "max_quantity": 2
    },
    {
        "id": "mana_efficiency",
        "name": "Mana Efficiency",
        "description": "Ultimate abilities cost 20% less mana",
        "category": "ability_upgrade",
        "price": 100,
        "rarity": "rare",
        "effects": {
            "mana_cost_reduction": 0.2,
            "applies_to": "ultimate"
        },
        "requirements": {"min_wins": 3},
        "max_quantity": 1
    },
    
    {
        "id": "health_boost_1",
        "name": "Vitality Potion",
        "description": "Permanently increases max health by 25",
        "category": "stat_boost",
        "price": 80,
        "rarity": "common",
        "effects": {
            "health_bonus": 25,
            "permanent": True
        },
        "requirements": None,
        "max_quantity": 5
    },
    {
        "id": "attack_boost_1",
        "name": "Strength Elixir",
        "description": "Permanently increases attack by 10",
        "category": "stat_boost",
        "price": 90,
        "rarity": "common",
        "effects": {
            "attack_bonus": 10,
            "permanent": True
        },
        "requirements": None,
        "max_quantity": 5
    },
    {
        "id": "speed_boost_1",
        "name": "Agility Serum",
        "description": "Permanently increases speed by 5",
        "category": "stat_boost",
        "price": 70,
        "rarity": "common",
        "effects": {
            "speed_bonus": 5,
            "permanent": True
        },
        "requirements": None,
        "max_quantity": 4
    },
    {
        "id": "armor_boost_1",
        "name": "Defensive Ward",
        "description": "Permanently increases armor by 8",
        "category": "stat_boost",
        "price": 85,
        "rarity": "common",
        "effects": {
            "armor_bonus": 8,
            "permanent": True
        },
        "requirements": None,
        "max_quantity": 4
    },
    
    {
        "id": "legendary_might",
        "name": "Legendary Might",
        "description": "Massive boost: +50 health, +20 attack, +10 speed",
        "category": "stat_boost",
        "price": 500,
        "rarity": "legendary",
        "effects": {
            "health_bonus": 50,
            "attack_bonus": 20,
            "speed_bonus": 10,
            "permanent": True
        },
        "requirements": {"min_wins": 15, "min_gold_spent": 1000},
        "max_quantity": 1
    },
    
    {
        "id": "healing_potion",
        "name": "Healing Potion",
        "description": "Restores 50 health during combat (single use)",
        "category": "consumable",
        "price": 30,
        "rarity": "common",
        "effects": {
            "heal_amount": 50,
            "single_use": True,
            "combat_item": True
        },
        "requirements": None,
        "max_quantity": 10
    },
    {
        "id": "mana_potion",
        "name": "Mana Potion",
        "description": "Instantly fills mana bar (single use)",
        "category": "consumable",
        "price": 40,
        "rarity": "common",
        "effects": {
            "mana_restore": 100,
            "single_use": True,
            "combat_item": True
        },
        "requirements": None,
        "max_quantity": 8
    },
    {
        "id": "berserker_rage",
        "name": "Berserker Rage",
        "description": "Doubles attack speed for 10 seconds (single use)",
        "category": "consumable",
        "price": 120,
        "rarity": "epic",
        "effects": {
            "speed_multiplier": 2.0,
            "duration": 10,
            "single_use": True,
            "combat_item": True
        },
        "requirements": {"min_wins": 8},
        "max_quantity": 3
    },
    {
        "id": "divine_protection",
        "name": "Divine Protection",
        "description": "Reduces all damage taken by 50% for 15 seconds",
        "category": "consumable",
        "price": 200,
        "rarity": "legendary",
        "effects": {
            "damage_reduction": 0.5,
            "duration": 15,
            "single_use": True,
            "combat_item": True
        },
        "requirements": {"min_wins": 12, "tournament_victories": 2},
        "max_quantity": 2
    }
]

def get_all_shop_items() -> List[Dict[str, Any]]:
    """Get all available shop items"""
    return SHOP_ITEMS.copy()

def get_shop_item_by_id(item_id: str) -> Optional[Dict[str, Any]]:
    """Get a specific shop item by ID"""
    for item in SHOP_ITEMS:
        if item["id"] == item_id:
            return item.copy()
    return None

def get_items_by_category(category: str) -> List[Dict[str, Any]]:
    """Get all items in a specific category"""
    return [item.copy() for item in SHOP_ITEMS if item["category"] == category]

def get_items_by_rarity(rarity: str) -> List[Dict[str, Any]]:
    """Get all items of a specific rarity"""
    return [item.copy() for item in SHOP_ITEMS if item["rarity"] == rarity]

def get_affordable_items(gold_amount: int) -> List[Dict[str, Any]]:
    """Get all items the player can afford"""
    return [item.copy() for item in SHOP_ITEMS if item["price"] <= gold_amount]
