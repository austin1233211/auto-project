"""Hero data management - port from frontend heroes.js"""

HEROES_DATA = [
    {
        "id": "warrior",
        "name": "Warrior",
        "type": "Strength",
        "avatar": "⚔️",
        "description": "A mighty melee fighter with high health and armor. Excels in close combat and can withstand heavy damage.",
        "stats": {
            "health": 120,
            "attack": 15,
            "armor": 8,
            "speed": 6
        },
        "abilities": {
            "passive": {"name": "Warrior Training", "description": "Gains damage reduction when health is low"},
            "ultimate": {"name": "Berserker", "description": "Increase attack speed when low HP"}
        }
    },
    {
        "id": "mage",
        "name": "Mage",
        "type": "Intelligence",
        "avatar": "🔮",
        "description": "A powerful spellcaster with devastating magical abilities. High damage but fragile.",
        "stats": {
            "health": 80,
            "attack": 25,
            "armor": 3,
            "speed": 7
        },
        "abilities": {
            "passive": {"name": "Arcane Mastery", "description": "Generates mana faster during combat"},
            "ultimate": {"name": "Fireball", "description": "Launch a burning projectile"}
        }
    },
    {
        "id": "archer",
        "name": "Archer",
        "type": "Agility",
        "avatar": "🏹",
        "description": "A swift ranged attacker with high accuracy and mobility. Strikes from a distance with precision.",
        "stats": {
            "health": 90,
            "attack": 20,
            "armor": 5,
            "speed": 9
        },
        "abilities": {
            "passive": {"name": "Eagle Eye", "description": "Chance for critical strikes with precision"},
            "ultimate": {"name": "Multi-Shot", "description": "Fire multiple arrows"}
        }
    },
    {
        "id": "assassin",
        "name": "Assassin",
        "type": "Agility",
        "avatar": "🗡️",
        "description": "A stealthy killer with high critical strike chance. Fast attacks and deadly precision.",
        "stats": {
            "health": 70,
            "attack": 22,
            "armor": 4,
            "speed": 10
        },
        "abilities": {
            "passive": {"name": "Shadow Step", "description": "Chance to dodge attacks with shadow movement"},
            "ultimate": {"name": "Backstab", "description": "Critical hit from behind"}
        }
    },
    {
        "id": "paladin",
        "name": "Paladin",
        "type": "Strength",
        "avatar": "🛡️",
        "description": "A holy warrior with healing abilities and strong defenses. Balanced offense and defense.",
        "stats": {
            "health": 110,
            "attack": 18,
            "armor": 7,
            "speed": 5
        },
        "abilities": {
            "passive": {"name": "Divine Blessing", "description": "Slowly regenerates health when critically wounded"},
            "ultimate": {"name": "Holy Strike", "description": "Divine damage with healing"}
        }
    },
    {
        "id": "necromancer",
        "name": "Necromancer",
        "type": "Intelligence",
        "avatar": "💀",
        "description": "A dark sorcerer who commands death magic. Can drain life and summon undead minions.",
        "stats": {
            "health": 85,
            "attack": 20,
            "armor": 4,
            "speed": 6
        },
        "abilities": {
            "passive": {"name": "Dark Aura", "description": "Drains enemy health over time in close proximity"},
            "ultimate": {"name": "Death Coil", "description": "Damages enemy or heals self"}
        }
    }
]

def get_all_heroes():
    """Get all available heroes"""
    return HEROES_DATA

def get_hero_by_id(hero_id: str):
    """Get a specific hero by ID"""
    for hero in HEROES_DATA:
        if hero["id"] == hero_id:
            return hero
    return None

def validate_hero_id(hero_id: str) -> bool:
    """Validate if a hero ID exists"""
    return get_hero_by_id(hero_id) is not None
