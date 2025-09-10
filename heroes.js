export const heroes = [
  {
    id: 'warrior',
    name: 'Warrior',
    type: 'Strength',
    avatar: '⚔️',
    description: 'A mighty melee fighter with high health and armor. Excels in close combat and can withstand heavy damage.',
    stats: {
      health: 1638,
      attack: 22,
      armor: 8,
      speed: 0.98,
      critChance: 0.08,
      critDamage: 1.4,
      evasionChance: 0.06,
      evasionDamageReduction: 0.20
    },
    abilities: {
      passive: { name: 'Warrior Training', description: 'Gains damage reduction when health is low' },
      ultimate: { name: 'Berserker', description: 'Increase attack speed when low HP' }
    }
  },
  {
    id: 'mage',
    name: 'Mage',
    type: 'Intelligence',
    avatar: '🔮',
    description: 'A powerful spellcaster with devastating magical abilities. High damage but fragile.',
    stats: {
      health: 1208,
      attack: 27,
      armor: 3,
      speed: 1.0,
      critChance: 0.10,
      critDamage: 1.5,
      evasionChance: 0.08,
      evasionDamageReduction: 0.15
    },
    abilities: {
      passive: { name: 'Arcane Mastery', description: 'Generates mana faster during combat' },
      ultimate: { name: 'Fireball', description: 'Launch a burning projectile' }
    }
  },
  {
    id: 'archer',
    name: 'Archer',
    type: 'Agility',
    avatar: '🏹',
    description: 'A swift ranged attacker with high accuracy and mobility. Strikes from a distance with precision.',
    stats: {
      health: 1315,
      attack: 24,
      armor: 5,
      speed: 1.08,
      critChance: 0.15,
      critDamage: 1.7,
      evasionChance: 0.12,
      evasionDamageReduction: 0.25
    },
    abilities: {
      passive: { name: 'Eagle Eye', description: 'Chance for critical strikes with precision' },
      ultimate: { name: 'Multi-Shot', description: 'Fire multiple arrows' }
    }
  },
  {
    id: 'assassin',
    name: 'Assassin',
    type: 'Agility',
    avatar: '🗡️',
    description: 'A stealthy killer with high critical strike chance. Fast attacks and deadly precision.',
    stats: {
      health: 1100,
      attack: 25,
      armor: 4,
      speed: 1.1,
      critChance: 0.18,
      critDamage: 1.8,
      evasionChance: 0.15,
      evasionDamageReduction: 0.30
    },
    abilities: {
      passive: { name: 'Shadow Step', description: 'Chance to dodge attacks with shadow movement' },
      ultimate: { name: 'Backstab', description: 'Critical hit from behind' }
    }
  },
  {
    id: 'paladin',
    name: 'Paladin',
    type: 'Strength',
    avatar: '🛡️',
    description: 'A holy warrior with healing abilities and strong defenses. Balanced offense and defense.',
    stats: {
      health: 1531,
      attack: 23,
      armor: 7,
      speed: 0.95,
      critChance: 0.09,
      critDamage: 1.4,
      evasionChance: 0.07,
      evasionDamageReduction: 0.18
    },
    abilities: {
      passive: { name: 'Divine Blessing', description: 'Slowly regenerates health when wounded' },
      ultimate: { name: 'Divine Shield', description: 'Immunity to damage briefly' }
    }
  },
  {
    id: 'necromancer',
    name: 'Necromancer',
    type: 'Intelligence',
    avatar: '💀',
    description: 'A dark mage who manipulates life and death. Drains enemy health while sustaining themselves.',
    stats: {
      health: 1262,
      attack: 26,
      armor: 4,
      speed: 0.98,
      critChance: 0.08,
      critDamage: 1.5,
      evasionChance: 0.07,
      evasionDamageReduction: 0.12
    },
    abilities: {
      passive: { name: 'Dark Aura', description: 'Drains small amounts of enemy health over time' },
      ultimate: { name: 'Death Coil', description: 'Heal self or damage enemy' }
    }
  },
  {
    id: 'alchemist',
    name: 'Alchemist',
    type: 'Intelligence',
    avatar: '🧪',
    description: 'A master of chemical warfare and transmutation. Creates powerful potions and explosive concoctions.',
    stats: {
      health: 1369,
      attack: 23,
      armor: 4,
      speed: 1.0,
      critChance: 0.11,
      critDamage: 1.6,
      evasionChance: 0.09,
      evasionDamageReduction: 0.18
    },
    abilities: {
      passive: { name: 'Chemical Mastery', description: 'Attacks have chance to reduce enemy armor' },
      ultimate: { name: 'Chemical Rage', description: 'Enhance abilities with chemicals' }
    }
  },
  {
    id: 'anti-mage',
    name: 'Anti-Mage',
    type: 'Agility',
    avatar: '🚫',
    description: 'A monk warrior dedicated to destroying magic users. Fast attacks that drain mana and punish spellcasters.',
    stats: {
      health: 1262,
      attack: 25,
      armor: 5,
      speed: 1.08,
      critChance: 0.16,
      critDamage: 1.7,
      evasionChance: 0.13,
      evasionDamageReduction: 0.28
    },
    abilities: {
      passive: { name: 'Mana Break', description: 'Attacks burn enemy mana' },
      ultimate: { name: 'Mana Void', description: 'Damage based on missing mana' }
    }
  },
  {
    id: 'axe',
    name: 'Axe',
    type: 'Strength',
    avatar: '🪓',
    description: 'A brutal berserker who thrives in the heat of battle. Taunts enemies and executes weakened foes.',
    stats: {
      health: 1692,
      attack: 22,
      armor: 6,
      speed: 0.95,
      critChance: 0.06,
      critDamage: 1.3,
      evasionChance: 0.05,
      evasionDamageReduction: 0.22
    },
    abilities: {
      passive: { name: 'Battle Hunger', description: 'Damage over time effect' },
      ultimate: { name: 'Culling Blade', description: 'Execute low health enemies' }
    }
  },
  {
    id: 'bristleback',
    name: 'Bristleback',
    type: 'Strength',
    avatar: '🦔',
    description: 'A spiny warrior covered in protective quills. Becomes stronger when taking damage from behind.',
    stats: {
      health: 1585,
      attack: 23,
      armor: 7,
      speed: 0.98,
      critChance: 0.08,
      critDamage: 1.4,
      evasionChance: 0.06,
      evasionDamageReduction: 0.20
    },
    abilities: {
      passive: { name: 'Bristleback', description: 'Reduce damage from behind' },
      ultimate: { name: 'Quill Spray', description: 'Shoot damaging quills' }
    }
  },
  {
    id: 'chaos-knight',
    name: 'Chaos Knight',
    type: 'Strength',
    avatar: '🌀',
    description: 'An agent of chaos with unpredictable abilities. Creates illusions and deals variable damage.',
    stats: {
      health: 1531,
      attack: 24,
      armor: 6,
      speed: 0.98,
      critChance: 0.08,
      critDamage: 1.4,
      evasionChance: 0.06,
      evasionDamageReduction: 0.20
    },
    abilities: {
      passive: { name: 'Chaos Strike', description: 'Attacks have random critical chance' },
      ultimate: { name: 'Phantasm', description: 'Create powerful illusions' }
    }
  },
  {
    id: 'clinkz',
    name: 'Clinkz',
    type: 'Agility',
    avatar: '💀',
    description: 'An undead archer with burning arrows. Moves invisibly and strikes with deadly precision.',
    stats: {
      health: 1154,
      attack: 26,
      armor: 3,
      speed: 1.1,
      critChance: 0.18,
      critDamage: 1.8,
      evasionChance: 0.15,
      evasionDamageReduction: 0.30
    },
    abilities: {
      passive: { name: 'Searing Arrows', description: 'Arrows deal fire damage over time' },
      ultimate: { name: 'Strafe', description: 'Rapid fire arrows' }
    }
  },
  {
    id: 'dragon-knight',
    name: 'Dragon Knight',
    type: 'Strength',
    avatar: '🐉',
    description: 'A noble knight with draconic powers. Transforms into a mighty dragon with devastating breath attacks.',
    stats: {
      health: 1638,
      attack: 23,
      armor: 8,
      speed: 0.96,
      critChance: 0.07,
      critDamage: 1.4,
      evasionChance: 0.06,
      evasionDamageReduction: 0.25
    },
    abilities: {
      passive: { name: 'Dragon Blood', description: 'Regeneration and armor' },
      ultimate: { name: 'Elder Dragon Form', description: 'Transform into dragon' }
    }
  },
  {
    id: 'earthshaker',
    name: 'Earthshaker',
    type: 'Strength',
    avatar: '⛰️',
    description: 'A mighty shaman who commands the earth itself. Creates fissures and devastating earthquakes.',
    stats: {
      health: 1477,
      attack: 24,
      armor: 5,
      speed: 0.98,
      critChance: 0.08,
      critDamage: 1.4,
      evasionChance: 0.06,
      evasionDamageReduction: 0.20
    },
    abilities: {
      passive: { name: 'Aftershock', description: 'Abilities stun nearby enemies' },
      ultimate: { name: 'Echo Slam', description: 'Damage based on enemy count' }
    }
  },
  {
    id: 'faceless-void',
    name: 'Faceless Void',
    type: 'Agility',
    avatar: '⏰',
    description: 'A being from outside time with temporal powers. Manipulates time to dodge attacks and trap enemies.',
    stats: {
      health: 1316,
      attack: 25,
      armor: 4,
      speed: 1.02,
      critChance: 0.14,
      critDamage: 1.7,
      evasionChance: 0.11,
      evasionDamageReduction: 0.25
    },
    abilities: {
      passive: { name: 'Time Lock', description: 'Chance to bash and slow' },
      ultimate: { name: 'Chronosphere', description: 'Stop time in an area' }
    }
  },
  {
    id: 'hoodwink',
    name: 'Hoodwink',
    type: 'Agility',
    avatar: '🦝',
    description: 'A cunning trickster who uses nature and deception. Sets traps and confuses enemies with illusions.',
    stats: {
      health: 1208,
      attack: 24,
      armor: 4,
      speed: 1.05,
      critChance: 0.16,
      critDamage: 1.7,
      evasionChance: 0.13,
      evasionDamageReduction: 0.28
    },
    abilities: {
      passive: { name: 'Scurry', description: 'Gains movement speed when taking damage' },
      ultimate: { name: 'Bushwhack', description: 'Tree trap that stuns' }
    }
  },
  {
    id: 'huskar',
    name: 'Huskar',
    type: 'Strength',
    avatar: '🔥',
    description: 'A sacred warrior who grows stronger as he nears death. Throws burning spears and sacrifices health for power.',
    stats: {
      health: 1423,
      attack: 24,
      armor: 4,
      speed: 1.0,
      critChance: 0.09,
      critDamage: 1.5,
      evasionChance: 0.07,
      evasionDamageReduction: 0.18
    },
    abilities: {
      passive: { name: 'Berserkers Blood', description: 'Power increases when wounded' },
      ultimate: { name: 'Inner Fire', description: 'Disarm and damage nearby foes' }
    }
  },
  {
    id: 'juggernaut',
    name: 'Juggernaut',
    type: 'Agility',
    avatar: '⚔️',
    description: 'A masked swordsman with incredible blade skills. Spins to damage all nearby enemies and strikes with precision.',
    stats: {
      health: 1369,
      attack: 26,
      armor: 5,
      speed: 1.02,
      critChance: 0.14,
      critDamage: 1.7,
      evasionChance: 0.11,
      evasionDamageReduction: 0.25
    },
    abilities: {
      passive: { name: 'Blade Dance', description: 'Chance for critical strikes' },
      ultimate: { name: 'Omnislash', description: 'Multiple target sword strikes' }
    }
  },
  {
    id: 'legion-commander',
    name: 'Legion Commander',
    type: 'Strength',
    avatar: '🛡️',
    description: 'A disciplined military leader who grows stronger with each victory. Challenges enemies to single combat.',
    stats: {
      health: 1585,
      attack: 23,
      armor: 7,
      speed: 0.98,
      critChance: 0.08,
      critDamage: 1.4,
      evasionChance: 0.06,
      evasionDamageReduction: 0.20
    },
    abilities: {
      passive: { name: 'Moment of Courage', description: 'Chance to counter-attack with lifesteal' },
      ultimate: { name: 'Duel', description: 'Force one-on-one combat' }
    }
  },
  {
    id: 'lina',
    name: 'Lina',
    type: 'Intelligence',
    avatar: '⚡',
    description: 'A fiery sorceress with devastating lightning magic. Casts powerful spells that grow stronger with each cast.',
    stats: {
      health: 1154,
      attack: 27,
      armor: 2,
      speed: 1.02,
      critChance: 0.11,
      critDamage: 1.6,
      evasionChance: 0.09,
      evasionDamageReduction: 0.18
    },
    abilities: {
      passive: { name: 'Fiery Soul', description: 'Spells increase attack and movement speed' },
      ultimate: { name: 'Laguna Blade', description: 'Massive lightning bolt' }
    }
  },
  {
    id: 'lion',
    name: 'Lion',
    type: 'Intelligence',
    avatar: '🦁',
    description: 'A demon witch with powerful hexes and life drain. Transforms enemies and steals their essence.',
    stats: {
      health: 1262,
      attack: 25,
      armor: 3,
      speed: 1.0,
      critChance: 0.10,
      critDamage: 1.5,
      evasionChance: 0.08,
      evasionDamageReduction: 0.15
    },
    abilities: {
      passive: { name: 'Mana Drain', description: 'Attacks steal enemy mana' },
      ultimate: { name: 'Finger of Death', description: 'Instant death magic' }
    }
  },
  {
    id: 'magnus',
    name: 'Magnus',
    type: 'Strength',
    avatar: '🐂',
    description: 'A mighty beast warrior with magnetic powers. Charges into battle and pulls enemies with magnetic force.',
    stats: {
      health: 1531,
      attack: 24,
      armor: 6,
      speed: 1.0,
      critChance: 0.08,
      critDamage: 1.4,
      evasionChance: 0.06,
      evasionDamageReduction: 0.20
    },
    abilities: {
      passive: { name: 'Empower', description: 'Enhanced damage and cleave attacks' },
      ultimate: { name: 'Reverse Polarity', description: 'Pull and stun enemies' }
    }
  },
  {
    id: 'mirana',
    name: 'Mirana',
    type: 'Agility',
    avatar: '🌙',
    description: 'A lunar priestess who rides with her sacred mount. Shoots sacred arrows and calls down starfall.',
    stats: {
      health: 1262,
      attack: 24,
      armor: 4,
      speed: 1.05,
      critChance: 0.16,
      critDamage: 1.7,
      evasionChance: 0.13,
      evasionDamageReduction: 0.28
    },
    abilities: {
      passive: { name: 'Leap', description: 'Enhanced mobility and evasion' },
      ultimate: { name: 'Sacred Arrow', description: 'Long range stunning projectile' }
    }
  },
  {
    id: 'omniknight',
    name: 'Omniknight',
    type: 'Strength',
    avatar: '✨',
    description: 'A holy paladin devoted to protecting others. Heals allies and grants powerful protective blessings.',
    stats: {
      health: 1638,
      attack: 22,
      armor: 8,
      speed: 0.96,
      critChance: 0.07,
      critDamage: 1.4,
      evasionChance: 0.06,
      evasionDamageReduction: 0.25
    },
    abilities: {
      passive: { name: 'Degen Aura', description: 'Slows nearby enemies' },
      ultimate: { name: 'Guardian Angel', description: 'Make allies immune to physical damage' }
    }
  },
  {
    id: 'pudge',
    name: 'Pudge',
    type: 'Strength',
    avatar: '🪝',
    description: 'A grotesque butcher with a meat hook. Pulls enemies close and dismembers them with brutal efficiency.',
    stats: {
      health: 1746,
      attack: 22,
      armor: 5,
      speed: 0.95,
      critChance: 0.06,
      critDamage: 1.3,
      evasionChance: 0.05,
      evasionDamageReduction: 0.22
    },
    abilities: {
      passive: { name: 'Flesh Heap', description: 'Gains health and magic resistance from kills' },
      ultimate: { name: 'Dismember', description: 'Channel to deal massive damage' }
    }
  },
  {
    id: 'riki',
    name: 'Riki',
    type: 'Agility',
    avatar: '👤',
    description: 'A master assassin who strikes from the shadows. Permanently invisible and deals bonus damage from behind.',
    stats: {
      health: 1100,
      attack: 26,
      armor: 3,
      speed: 1.1,
      critChance: 0.18,
      critDamage: 1.8,
      evasionChance: 0.15,
      evasionDamageReduction: 0.30
    },
    abilities: {
      passive: { name: 'Permanent Invisibility', description: 'Always invisible when not attacking' },
      ultimate: { name: 'Smoke Screen', description: 'Blind and silence enemies' }
    }
  },
  {
    id: 'shadow-fiend',
    name: 'Shadow Fiend',
    type: 'Agility',
    avatar: '👹',
    description: 'A demonic entity that collects souls. Grows stronger with each kill and unleashes devastating shadow magic.',
    stats: {
      health: 1208,
      attack: 27,
      armor: 3,
      speed: 1.02,
      critChance: 0.14,
      critDamage: 1.7,
      evasionChance: 0.12,
      evasionDamageReduction: 0.28
    },
    abilities: {
      passive: { name: 'Necromastery', description: 'Gain damage from kills' },
      ultimate: { name: 'Requiem of Souls', description: 'Release collected souls' }
    }
  },
  {
    id: 'skywrath-mage',
    name: 'Skywrath Mage',
    type: 'Intelligence',
    avatar: '🦅',
    description: 'A celestial mage with mastery over arcane forces. Rains down magical bolts from the heavens.',
    stats: {
      health: 1100,
      attack: 28,
      armor: 2,
      speed: 1.02,
      critChance: 0.11,
      critDamage: 1.6,
      evasionChance: 0.09,
      evasionDamageReduction: 0.18
    },
    abilities: {
      passive: { name: 'Ancient Seal', description: 'Spells amplify damage on enemies' },
      ultimate: { name: 'Mystic Flare', description: 'Concentrated magical damage' }
    }
  },
  {
    id: 'slark',
    name: 'Slark',
    type: 'Agility',
    avatar: '🐟',
    description: 'An escaped prisoner from the depths. Steals enemy attributes and becomes stronger in darkness.',
    stats: {
      health: 1262,
      attack: 25,
      armor: 4,
      speed: 1.05,
      critChance: 0.16,
      critDamage: 1.7,
      evasionChance: 0.13,
      evasionDamageReduction: 0.28
    },
    abilities: {
      passive: { name: 'Essence Shift', description: 'Steals enemy attributes on attack' },
      ultimate: { name: 'Shadow Dance', description: 'Become untargetable' }
    }
  },
  {
    id: 'sniper',
    name: 'Sniper',
    type: 'Agility',
    avatar: '🎯',
    description: 'A keen marksman with exceptional range. Picks off enemies from great distances with precise shots.',
    stats: {
      health: 1154,
      attack: 26,
      armor: 3,
      speed: 1.0,
      critChance: 0.13,
      critDamage: 1.7,
      evasionChance: 0.11,
      evasionDamageReduction: 0.25
    },
    abilities: {
      passive: { name: 'Headshot', description: 'Chance for bonus damage' },
      ultimate: { name: 'Assassinate', description: 'Long range high damage shot' }
    }
  },
  {
    id: 'sven',
    name: 'Sven',
    type: 'Strength',
    avatar: '⚔️',
    description: 'A rogue knight seeking redemption. Wields a massive sword and can transform into an unstoppable force.',
    stats: {
      health: 1585,
      attack: 24,
      armor: 6,
      speed: 0.98,
      critChance: 0.08,
      critDamage: 1.4,
      evasionChance: 0.06,
      evasionDamageReduction: 0.20
    },
    abilities: {
      passive: { name: 'Great Cleave', description: 'Attacks hit multiple enemies' },
      ultimate: { name: 'Gods Strength', description: 'Massive damage increase' }
    }
  },
  {
    id: 'tidehunter',
    name: 'Tidehunter',
    type: 'Strength',
    avatar: '🌊',
    description: 'An ancient sea creature with control over the tides. Creates devastating waves and anchors enemies.',
    stats: {
      health: 1692,
      attack: 22,
      armor: 7,
      speed: 0.96,
      critChance: 0.07,
      critDamage: 1.4,
      evasionChance: 0.06,
      evasionDamageReduction: 0.25
    },
    abilities: {
      passive: { name: 'Kraken Shell', description: 'Damage reduction and purge' },
      ultimate: { name: 'Ravage', description: 'Massive area tentacle slam' }
    }
  },
  {
    id: 'tiny',
    name: 'Tiny',
    type: 'Strength',
    avatar: '🗿',
    description: 'A living stone giant that grows larger over time. Throws boulders and allies with devastating force.',
    stats: {
      health: 1800,
      attack: 21,
      armor: 8,
      speed: 0.95,
      critChance: 0.06,
      critDamage: 1.3,
      evasionChance: 0.05,
      evasionDamageReduction: 0.22
    },
    abilities: {
      passive: { name: 'Craggy Exterior', description: 'Chance to stun attackers' },
      ultimate: { name: 'Grow', description: 'Increase size and power' }
    }
  },
  {
    id: 'undying',
    name: 'Undying',
    type: 'Strength',
    avatar: '🧟',
    description: 'A necromantic warrior who commands the undead. Steals enemy strength and summons zombie hordes.',
    stats: {
      health: 1531,
      attack: 23,
      armor: 6,
      speed: 0.98,
      critChance: 0.08,
      critDamage: 1.4,
      evasionChance: 0.06,
      evasionDamageReduction: 0.20
    },
    abilities: {
      passive: { name: 'Undying Will', description: 'Gains strength when enemies die nearby' },
      ultimate: { name: 'Tombstone', description: 'Summon zombie spawner' }
    }
  },
  {
    id: 'viper',
    name: 'Viper',
    type: 'Intelligence',
    avatar: '🐍',
    description: 'A venomous flying serpent with toxic attacks. Poisons enemies and becomes more dangerous when wounded.',
    stats: {
      health: 1316,
      attack: 24,
      armor: 5,
      speed: 1.0,
      critChance: 0.10,
      critDamage: 1.5,
      evasionChance: 0.08,
      evasionDamageReduction: 0.15
    },
    abilities: {
      passive: { name: 'Poison Attack', description: 'Toxic damage over time' },
      ultimate: { name: 'Viper Strike', description: 'Slowing poison projectile' }
    }
  },
  {
    id: 'yamashita',
    name: 'Yamashita',
    type: 'Intelligence',
    avatar: '🎌',
    description: 'A mystical warrior from ancient lands. Combines martial arts with elemental magic for devastating combos.',
    stats: {
      health: 1370,
      attack: 24,
      armor: 4,
      speed: 1.0,
      critChance: 0.10,
      critDamage: 1.5,
      evasionChance: 0.08,
      evasionDamageReduction: 0.15
    },
    abilities: {
      passive: { name: 'Elemental Strike', description: 'Attacks cycle through elements' },
      ultimate: { name: 'Ancient Technique', description: 'Powerful combo attack' }
    }
  },
  {
    id: 'zombie-guitarist',
    name: 'Zombie Guitarist',
    type: 'Intelligence',
    avatar: '🎸',
    description: 'An undead musician whose haunting melodies drive enemies mad. Uses sonic attacks and necromantic rhythms.',
    stats: {
      health: 1262,
      attack: 25,
      armor: 3,
      speed: 0.98,
      critChance: 0.10,
      critDamage: 1.5,
      evasionChance: 0.08,
      evasionDamageReduction: 0.15
    },
    abilities: {
      passive: { name: 'Undead Resilience', description: 'Immune to certain status effects' },
      ultimate: { name: 'Resurrection Riff', description: 'Revive fallen allies' }
    }
  }
];
