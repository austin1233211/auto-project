export const heroes = [
  {
    id: 'warrior',
    name: 'Warrior',
    type: 'Strength',
    avatar: '⚔️',
    description: 'A mighty melee fighter with high health and armor. Excels in close combat and can withstand heavy damage.',
    stats: {
      health: 120,
      attack: 15,
      armor: 8,
      speed: 6
    },
    abilities: [
      { name: 'Charge', description: 'Rush forward dealing damage' },
      { name: 'Shield Block', description: 'Reduce incoming damage' },
      { name: 'Berserker', description: 'Increase attack speed when low HP' }
    ]
  },
  {
    id: 'mage',
    name: 'Mage',
    type: 'Intelligence',
    avatar: '🔮',
    description: 'A powerful spellcaster with devastating magical abilities. High damage but fragile.',
    stats: {
      health: 80,
      attack: 25,
      armor: 3,
      speed: 7
    },
    abilities: [
      { name: 'Fireball', description: 'Launch a burning projectile' },
      { name: 'Magic Shield', description: 'Absorb magical damage' },
      { name: 'Teleport', description: 'Instantly move to avoid attacks' }
    ]
  },
  {
    id: 'archer',
    name: 'Archer',
    type: 'Agility',
    avatar: '🏹',
    description: 'A swift ranged attacker with high accuracy and mobility. Strikes from a distance with precision.',
    stats: {
      health: 90,
      attack: 20,
      armor: 5,
      speed: 9
    },
    abilities: [
      { name: 'Multi-Shot', description: 'Fire multiple arrows' },
      { name: 'Evasion', description: 'Chance to dodge attacks' },
      { name: 'Poison Arrow', description: 'Deal damage over time' }
    ]
  },
  {
    id: 'assassin',
    name: 'Assassin',
    type: 'Agility',
    avatar: '🗡️',
    description: 'A stealthy killer with high critical strike chance. Fast attacks and deadly precision.',
    stats: {
      health: 70,
      attack: 22,
      armor: 4,
      speed: 10
    },
    abilities: [
      { name: 'Backstab', description: 'Critical hit from behind' },
      { name: 'Stealth', description: 'Become invisible briefly' },
      { name: 'Poison Blade', description: 'Attacks apply poison' }
    ]
  },
  {
    id: 'paladin',
    name: 'Paladin',
    type: 'Strength',
    avatar: '🛡️',
    description: 'A holy warrior with healing abilities and strong defenses. Balanced offense and defense.',
    stats: {
      health: 110,
      attack: 18,
      armor: 7,
      speed: 5
    },
    abilities: [
      { name: 'Holy Strike', description: 'Divine damage attack' },
      { name: 'Heal', description: 'Restore health over time' },
      { name: 'Divine Shield', description: 'Immunity to damage briefly' }
    ]
  },
  {
    id: 'necromancer',
    name: 'Necromancer',
    type: 'Intelligence',
    avatar: '💀',
    description: 'A dark mage who manipulates life and death. Drains enemy health while sustaining themselves.',
    stats: {
      health: 85,
      attack: 23,
      armor: 4,
      speed: 6
    },
    abilities: [
      { name: 'Life Drain', description: 'Steal enemy health' },
      { name: 'Summon Skeleton', description: 'Create undead ally' },
      { name: 'Death Coil', description: 'Heal self or damage enemy' }
    ]
  }
];
