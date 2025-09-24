export const REGEN_SECT_ABILITIES = {
  1: [
    { name: 'Natural Healing', effect: 'health_regen_flat', value: 10, emoji: '🌿', description: 'Every 1 second restore 10 HP' },
    { name: 'Healing Interference', effect: 'opponent_heal_resist', value: 18, emoji: '🚫', description: 'Opponents have 18% chance to fail their own restore HP effects' },
    { name: 'Healing Strike', effect: 'attack_heal_chance', value: 60, emoji: '⚔️', description: '60% chance to regen 10 HP per attack' },
    { name: 'Unseen Healing', effect: 'evade_heal', value: 10, emoji: '👻', description: 'Restore 10 HP with each evasion' },
    { name: 'Burst Regeneration', effect: 'crit_heal', value: 10, emoji: '💥', description: 'With each crit restore 10 HP' },
    { name: 'Body of Regen', effect: 'health_regen_percent', value: 1, emoji: '❤️', description: 'Every 1.2 seconds restore 1% HP' },
    { name: 'Ultimate Restoration', effect: 'ultimate_heal', value: 100, emoji: '✨', description: 'Each cast of your ultimate restores 100 HP' },
    { name: 'Poisonous Medicine', effect: 'heal_poison_chance', value: 35, emoji: '☠️', description: '35% chance to apply 4 stacks of poison to opponent when you restore HP' },
    { name: 'Freezing Healing', effect: 'heal_frost_chance', value: 35, emoji: '❄️', description: '35% chance to apply 5 stacks of frost to opponent when you restore HP' },
    { name: 'Healing Shield', effect: 'heal_shield_chance', value: 35, emoji: '🛡️', description: '35% chance to gain 4 stacks of shield to self when you restore HP' },
    { name: 'Regenerative Aura', effect: 'aura_heal_nearby', value: 5, emoji: '🌟', description: 'Nearby allies regenerate 5 HP per second' },
    { name: 'Vampiric Recovery', effect: 'damage_to_heal', value: 15, emoji: '🩸', description: '15% of damage dealt is converted to healing' },
    { name: 'Meditation', effect: 'mana_to_heal', value: 2, emoji: '🧘', description: 'Convert 2 mana per second into 8 HP' },
    { name: 'Phoenix Blood', effect: 'low_hp_regen_boost', value: 25, emoji: '🔥', description: 'Healing effects are 25% stronger when below 30% HP' }
  ],
  2: [
    { name: 'Shadow Rays', effect: 'heal_damage_chance', value: 25, emoji: '🌑', description: '25% chance to deal 100 damage when you restore HP' },
    { name: 'Holy Light Detonation', effect: 'heal_threshold_damage', value: 400, emoji: '💡', description: 'When you restore 400 HP total, deal 100 damage to opponent (every 400 HP restored)' },
    { name: 'Power of Earth', effect: 'enhanced_regen', value: 35, emoji: '🌍', description: 'Every 0.8 seconds restore 35 HP' }
  ],
  3: [
    { name: 'False Promise', effect: 'low_hp_heal_double', value: 20, emoji: '💫', description: 'When HP drops below 20%, any HP restore effect is doubled for 5 seconds' },
    { name: 'Heartstopper Aura', effect: 'heal_to_damage_aura', value: 40, emoji: '💀', description: 'Deals magic damage equal to 40% of health restored per second' },
    { name: 'Rain of Destiny', effect: 'heal_to_attack_boost', value: 40, emoji: '🌧️', description: 'Every 2 seconds, the next basic attack deals 40% of the HP you restore' }
  ]
};
