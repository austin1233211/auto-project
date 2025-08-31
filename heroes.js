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
  },
  {
    id: 'alchemist',
    name: 'Alchemist',
    type: 'Intelligence',
    avatar: '🧪',
    description: 'A master of chemical warfare and transmutation. Creates powerful potions and explosive concoctions.',
    stats: {
      health: 95,
      attack: 18,
      armor: 4,
      speed: 7
    },
    abilities: [
      { name: 'Acid Spray', description: 'Spray corrosive acid in an area' },
      { name: 'Unstable Concoction', description: 'Throw explosive potion' },
      { name: 'Chemical Rage', description: 'Enhance abilities with chemicals' }
    ]
  },
  {
    id: 'anti-mage',
    name: 'Anti-Mage',
    type: 'Agility',
    avatar: '🚫',
    description: 'A monk warrior dedicated to destroying magic users. Fast attacks that drain mana and punish spellcasters.',
    stats: {
      health: 85,
      attack: 21,
      armor: 5,
      speed: 9
    },
    abilities: [
      { name: 'Mana Break', description: 'Attacks burn enemy mana' },
      { name: 'Blink', description: 'Short distance teleportation' },
      { name: 'Mana Void', description: 'Damage based on missing mana' }
    ]
  },
  {
    id: 'axe',
    name: 'Axe',
    type: 'Strength',
    avatar: '🪓',
    description: 'A brutal berserker who thrives in the heat of battle. Taunts enemies and executes weakened foes.',
    stats: {
      health: 125,
      attack: 16,
      armor: 6,
      speed: 5
    },
    abilities: [
      { name: 'Berserkers Call', description: 'Force enemies to attack you' },
      { name: 'Battle Hunger', description: 'Damage over time effect' },
      { name: 'Culling Blade', description: 'Execute low health enemies' }
    ]
  },
  {
    id: 'bristleback',
    name: 'Bristleback',
    type: 'Strength',
    avatar: '🦔',
    description: 'A spiny warrior covered in protective quills. Becomes stronger when taking damage from behind.',
    stats: {
      health: 115,
      attack: 17,
      armor: 7,
      speed: 6
    },
    abilities: [
      { name: 'Viscous Nasal Goo', description: 'Slow and weaken enemies' },
      { name: 'Quill Spray', description: 'Shoot damaging quills' },
      { name: 'Bristleback', description: 'Reduce damage from behind' }
    ]
  },
  {
    id: 'chaos-knight',
    name: 'Chaos Knight',
    type: 'Strength',
    avatar: '🌀',
    description: 'An agent of chaos with unpredictable abilities. Creates illusions and deals variable damage.',
    stats: {
      health: 110,
      attack: 19,
      armor: 6,
      speed: 6
    },
    abilities: [
      { name: 'Chaos Bolt', description: 'Random damage and stun' },
      { name: 'Reality Rift', description: 'Pull enemy through dimensions' },
      { name: 'Phantasm', description: 'Create powerful illusions' }
    ]
  },
  {
    id: 'clinkz',
    name: 'Clinkz',
    type: 'Agility',
    avatar: '💀',
    description: 'An undead archer with burning arrows. Moves invisibly and strikes with deadly precision.',
    stats: {
      health: 75,
      attack: 24,
      armor: 3,
      speed: 10
    },
    abilities: [
      { name: 'Strafe', description: 'Rapid fire arrows' },
      { name: 'Skeleton Walk', description: 'Become invisible and fast' },
      { name: 'Death Pact', description: 'Consume ally for power' }
    ]
  },
  {
    id: 'dragon-knight',
    name: 'Dragon Knight',
    type: 'Strength',
    avatar: '🐉',
    description: 'A noble knight with draconic powers. Transforms into a mighty dragon with devastating breath attacks.',
    stats: {
      health: 120,
      attack: 18,
      armor: 8,
      speed: 5
    },
    abilities: [
      { name: 'Dragon Tail', description: 'Stunning melee attack' },
      { name: 'Dragon Blood', description: 'Regeneration and armor' },
      { name: 'Elder Dragon Form', description: 'Transform into dragon' }
    ]
  },
  {
    id: 'earthshaker',
    name: 'Earthshaker',
    type: 'Strength',
    avatar: '⛰️',
    description: 'A mighty shaman who commands the earth itself. Creates fissures and devastating earthquakes.',
    stats: {
      health: 105,
      attack: 20,
      armor: 5,
      speed: 6
    },
    abilities: [
      { name: 'Fissure', description: 'Create blocking earth wall' },
      { name: 'Enchant Totem', description: 'Empower next attack' },
      { name: 'Echo Slam', description: 'Damage based on enemy count' }
    ]
  },
  {
    id: 'faceless-void',
    name: 'Faceless Void',
    type: 'Agility',
    avatar: '⏰',
    description: 'A being from outside time with temporal powers. Manipulates time to dodge attacks and trap enemies.',
    stats: {
      health: 90,
      attack: 22,
      armor: 4,
      speed: 8
    },
    abilities: [
      { name: 'Time Walk', description: 'Leap through time' },
      { name: 'Time Lock', description: 'Chance to bash and slow' },
      { name: 'Chronosphere', description: 'Stop time in an area' }
    ]
  },
  {
    id: 'hoodwink',
    name: 'Hoodwink',
    type: 'Agility',
    avatar: '🦝',
    description: 'A cunning trickster who uses nature and deception. Sets traps and confuses enemies with illusions.',
    stats: {
      health: 80,
      attack: 19,
      armor: 4,
      speed: 9
    },
    abilities: [
      { name: 'Acorn Shot', description: 'Bouncing projectile attack' },
      { name: 'Bushwhack', description: 'Tree trap that stuns' },
      { name: 'Decoy', description: 'Create misleading illusion' }
    ]
  },
  {
    id: 'huskar',
    name: 'Huskar',
    type: 'Strength',
    avatar: '🔥',
    description: 'A sacred warrior who grows stronger as he nears death. Throws burning spears and sacrifices health for power.',
    stats: {
      health: 100,
      attack: 20,
      armor: 4,
      speed: 7
    },
    abilities: [
      { name: 'Inner Fire', description: 'Disarm and damage nearby foes' },
      { name: 'Burning Spear', description: 'Flaming projectile attack' },
      { name: 'Berserkers Blood', description: 'Power increases when wounded' }
    ]
  },
  {
    id: 'juggernaut',
    name: 'Juggernaut',
    type: 'Agility',
    avatar: '⚔️',
    description: 'A masked swordsman with incredible blade skills. Spins to damage all nearby enemies and strikes with precision.',
    stats: {
      health: 95,
      attack: 23,
      armor: 5,
      speed: 8
    },
    abilities: [
      { name: 'Blade Fury', description: 'Spinning blade attack' },
      { name: 'Healing Ward', description: 'Summon regenerating totem' },
      { name: 'Omnislash', description: 'Multiple target sword strikes' }
    ]
  },
  {
    id: 'legion-commander',
    name: 'Legion Commander',
    type: 'Strength',
    avatar: '🛡️',
    description: 'A disciplined military leader who grows stronger with each victory. Challenges enemies to single combat.',
    stats: {
      health: 115,
      attack: 17,
      armor: 7,
      speed: 6
    },
    abilities: [
      { name: 'Overwhelming Odds', description: 'Damage based on enemy count' },
      { name: 'Press the Attack', description: 'Heal and boost ally' },
      { name: 'Duel', description: 'Force one-on-one combat' }
    ]
  },
  {
    id: 'lina',
    name: 'Lina',
    type: 'Intelligence',
    avatar: '⚡',
    description: 'A fiery sorceress with devastating lightning magic. Casts powerful spells that grow stronger with each cast.',
    stats: {
      health: 75,
      attack: 26,
      armor: 2,
      speed: 8
    },
    abilities: [
      { name: 'Dragon Slave', description: 'Linear fire wave' },
      { name: 'Light Strike Array', description: 'Delayed area stun' },
      { name: 'Laguna Blade', description: 'Massive lightning bolt' }
    ]
  },
  {
    id: 'lion',
    name: 'Lion',
    type: 'Intelligence',
    avatar: '🦁',
    description: 'A demon witch with powerful hexes and life drain. Transforms enemies and steals their essence.',
    stats: {
      health: 85,
      attack: 21,
      armor: 3,
      speed: 7
    },
    abilities: [
      { name: 'Earth Spike', description: 'Ground piercing spikes' },
      { name: 'Hex', description: 'Transform enemy into harmless creature' },
      { name: 'Finger of Death', description: 'Instant death magic' }
    ]
  },
  {
    id: 'magnus',
    name: 'Magnus',
    type: 'Strength',
    avatar: '🐂',
    description: 'A mighty beast warrior with magnetic powers. Charges into battle and pulls enemies with magnetic force.',
    stats: {
      health: 110,
      attack: 19,
      armor: 6,
      speed: 7
    },
    abilities: [
      { name: 'Shockwave', description: 'Damaging energy wave' },
      { name: 'Empower', description: 'Enhance ally damage' },
      { name: 'Reverse Polarity', description: 'Pull and stun enemies' }
    ]
  },
  {
    id: 'mirana',
    name: 'Mirana',
    type: 'Agility',
    avatar: '🌙',
    description: 'A lunar priestess who rides with her sacred mount. Shoots sacred arrows and calls down starfall.',
    stats: {
      health: 85,
      attack: 20,
      armor: 4,
      speed: 9
    },
    abilities: [
      { name: 'Sacred Arrow', description: 'Long range stunning projectile' },
      { name: 'Starstorm', description: 'Falling stars damage enemies' },
      { name: 'Moonlight Shadow', description: 'Grant invisibility to allies' }
    ]
  },
  {
    id: 'omniknight',
    name: 'Omniknight',
    type: 'Strength',
    avatar: '✨',
    description: 'A holy paladin devoted to protecting others. Heals allies and grants powerful protective blessings.',
    stats: {
      health: 120,
      attack: 16,
      armor: 8,
      speed: 5
    },
    abilities: [
      { name: 'Purification', description: 'Heal ally and damage enemies' },
      { name: 'Heavenly Grace', description: 'Grant magic immunity' },
      { name: 'Guardian Angel', description: 'Make allies immune to physical damage' }
    ]
  },
  {
    id: 'pudge',
    name: 'Pudge',
    type: 'Strength',
    avatar: '🪝',
    description: 'A grotesque butcher with a meat hook. Pulls enemies close and dismembers them with brutal efficiency.',
    stats: {
      health: 130,
      attack: 15,
      armor: 5,
      speed: 4
    },
    abilities: [
      { name: 'Meat Hook', description: 'Pull enemy to you' },
      { name: 'Rot', description: 'Toxic aura damages nearby enemies' },
      { name: 'Dismember', description: 'Channel to deal massive damage' }
    ]
  },
  {
    id: 'riki',
    name: 'Riki',
    type: 'Agility',
    avatar: '👤',
    description: 'A master assassin who strikes from the shadows. Permanently invisible and deals bonus damage from behind.',
    stats: {
      health: 70,
      attack: 24,
      armor: 3,
      speed: 10
    },
    abilities: [
      { name: 'Smoke Screen', description: 'Blind and silence enemies' },
      { name: 'Blink Strike', description: 'Teleport behind enemy' },
      { name: 'Permanent Invisibility', description: 'Always invisible when not attacking' }
    ]
  },
  {
    id: 'shadow-fiend',
    name: 'Shadow Fiend',
    type: 'Agility',
    avatar: '👹',
    description: 'A demonic entity that collects souls. Grows stronger with each kill and unleashes devastating shadow magic.',
    stats: {
      health: 80,
      attack: 25,
      armor: 3,
      speed: 8
    },
    abilities: [
      { name: 'Shadowraze', description: 'Shadow damage at range' },
      { name: 'Necromastery', description: 'Gain damage from kills' },
      { name: 'Requiem of Souls', description: 'Release collected souls' }
    ]
  },
  {
    id: 'skywrath-mage',
    name: 'Skywrath Mage',
    type: 'Intelligence',
    avatar: '🦅',
    description: 'A celestial mage with mastery over arcane forces. Rains down magical bolts from the heavens.',
    stats: {
      health: 70,
      attack: 27,
      armor: 2,
      speed: 8
    },
    abilities: [
      { name: 'Arcane Bolt', description: 'Seeking magical projectile' },
      { name: 'Concussive Shot', description: 'Slow and damage enemy' },
      { name: 'Mystic Flare', description: 'Concentrated magical damage' }
    ]
  },
  {
    id: 'slark',
    name: 'Slark',
    type: 'Agility',
    avatar: '🐟',
    description: 'An escaped prisoner from the depths. Steals enemy attributes and becomes stronger in darkness.',
    stats: {
      health: 85,
      attack: 21,
      armor: 4,
      speed: 9
    },
    abilities: [
      { name: 'Dark Pact', description: 'Purge debuffs and damage self' },
      { name: 'Pounce', description: 'Leap and tether enemy' },
      { name: 'Shadow Dance', description: 'Become untargetable' }
    ]
  },
  {
    id: 'sniper',
    name: 'Sniper',
    type: 'Agility',
    avatar: '🎯',
    description: 'A keen marksman with exceptional range. Picks off enemies from great distances with precise shots.',
    stats: {
      health: 75,
      attack: 23,
      armor: 3,
      speed: 7
    },
    abilities: [
      { name: 'Shrapnel', description: 'Area damage over time' },
      { name: 'Headshot', description: 'Chance for bonus damage' },
      { name: 'Assassinate', description: 'Long range high damage shot' }
    ]
  },
  {
    id: 'sven',
    name: 'Sven',
    type: 'Strength',
    avatar: '⚔️',
    description: 'A rogue knight seeking redemption. Wields a massive sword and can transform into an unstoppable force.',
    stats: {
      health: 115,
      attack: 20,
      armor: 6,
      speed: 6
    },
    abilities: [
      { name: 'Storm Hammer', description: 'Stunning projectile' },
      { name: 'Warcry', description: 'Boost allies speed and armor' },
      { name: 'Gods Strength', description: 'Massive damage increase' }
    ]
  },
  {
    id: 'tidehunter',
    name: 'Tidehunter',
    type: 'Strength',
    avatar: '🌊',
    description: 'An ancient sea creature with control over the tides. Creates devastating waves and anchors enemies.',
    stats: {
      health: 125,
      attack: 16,
      armor: 7,
      speed: 5
    },
    abilities: [
      { name: 'Gush', description: 'Water blast that slows' },
      { name: 'Kraken Shell', description: 'Damage reduction and purge' },
      { name: 'Ravage', description: 'Massive area tentacle slam' }
    ]
  },
  {
    id: 'tiny',
    name: 'Tiny',
    type: 'Strength',
    avatar: '🗿',
    description: 'A living stone giant that grows larger over time. Throws boulders and allies with devastating force.',
    stats: {
      health: 135,
      attack: 14,
      armor: 8,
      speed: 4
    },
    abilities: [
      { name: 'Avalanche', description: 'Falling rocks stun and damage' },
      { name: 'Toss', description: 'Throw unit at enemies' },
      { name: 'Grow', description: 'Increase size and power' }
    ]
  },
  {
    id: 'undying',
    name: 'Undying',
    type: 'Strength',
    avatar: '🧟',
    description: 'A necromantic warrior who commands the undead. Steals enemy strength and summons zombie hordes.',
    stats: {
      health: 110,
      attack: 17,
      armor: 6,
      speed: 6
    },
    abilities: [
      { name: 'Decay', description: 'Steal enemy strength' },
      { name: 'Soul Rip', description: 'Heal or damage based on units' },
      { name: 'Tombstone', description: 'Summon zombie spawner' }
    ]
  },
  {
    id: 'viper',
    name: 'Viper',
    type: 'Intelligence',
    avatar: '🐍',
    description: 'A venomous flying serpent with toxic attacks. Poisons enemies and becomes more dangerous when wounded.',
    stats: {
      health: 90,
      attack: 19,
      armor: 5,
      speed: 7
    },
    abilities: [
      { name: 'Poison Attack', description: 'Toxic damage over time' },
      { name: 'Nethertoxin', description: 'Area poison cloud' },
      { name: 'Viper Strike', description: 'Slowing poison projectile' }
    ]
  },
  {
    id: 'yamashita',
    name: 'Yamashita',
    type: 'Intelligence',
    avatar: '🎌',
    description: 'A mystical warrior from ancient lands. Combines martial arts with elemental magic for devastating combos.',
    stats: {
      health: 95,
      attack: 20,
      armor: 4,
      speed: 7
    },
    abilities: [
      { name: 'Elemental Strike', description: 'Attacks cycle through elements' },
      { name: 'Spirit Form', description: 'Become ethereal briefly' },
      { name: 'Ancient Technique', description: 'Powerful combo attack' }
    ]
  },
  {
    id: 'zombie-guitarist',
    name: 'Zombie Guitarist',
    type: 'Intelligence',
    avatar: '🎸',
    description: 'An undead musician whose haunting melodies drive enemies mad. Uses sonic attacks and necromantic rhythms.',
    stats: {
      health: 85,
      attack: 22,
      armor: 3,
      speed: 6
    },
    abilities: [
      { name: 'Power Chord', description: 'Stunning sonic blast' },
      { name: 'Death Metal', description: 'Area fear effect' },
      { name: 'Resurrection Riff', description: 'Revive fallen allies' }
    ]
  }
];
