export const ATTACK_SECT_ABILITIES = {
  1: [
    { name: 'Keen Blade', effect: 'attack_boost', value: 5, emoji: '⚔️', description: 'Increases base damage by 5' },
    { name: 'Wear Blade', effect: 'block_chance', value: 8, emoji: '🛡️', description: 'Enemy attacks have 8% chance of being blocked' },
    { name: 'Unseen Blade', effect: 'evasion_attack_bonus', value: 1, emoji: '👻', description: 'Grants 1% of attack damage for every 3 base evasion' },
    { name: 'Burst Blade', effect: 'crit_attack_boost', value: 6, emoji: '💥', description: 'Each crit increases attack by 6 for 3 seconds' },
    { name: 'Healing Strike', effect: 'attack_heal', value: 10, emoji: '❤️', description: '60% chance to regenerate 10 health with each attack' },
    { name: 'Venom Strike', effect: 'attack_poison', value: 4, emoji: '☠️', description: '60% chance to apply 4 poison stacks with each attack' },
    { name: 'Arcane Blade', effect: 'attack_mana', value: 3, emoji: '🔮', description: '60% chance to restore 3 mana with each attack' },
    { name: 'Frost Strike', effect: 'attack_frost', value: 5, emoji: '❄️', description: '60% chance to apply 5 frost stacks with each attack' },
    { name: 'Bulwark', effect: 'attack_shield', value: 4, emoji: '🛡️', description: '60% chance to gain 4 shield stacks with each attack' },
    { name: 'Razor Edge', effect: 'attack_bleed', value: 8, emoji: '🩸', description: '15% chance to cause bleeding, dealing 8 damage over 4 seconds' },
    { name: 'Weapon Mastery', effect: 'attack_speed_boost', value: 8, emoji: '⚡', description: 'Increases attack speed by 8% permanently' },
    { name: 'Berserker Focus', effect: 'kill_attack_boost', value: 12, emoji: '🔥', description: 'After killing an enemy, gain 12 attack damage for 6 seconds' },
    { name: 'Crushing Blow', effect: 'armor_pierce_chance', value: 20, emoji: '💪', description: '20% chance for attacks to ignore 50% of enemy armor' },
    { name: 'Battle Fury', effect: 'consecutive_attack_boost', value: 3, emoji: '⚔️', description: 'Each consecutive attack on same target increases damage by 3%, up to 15%' }
  ],
  2: [
    { name: 'Blood Thirsty Strike', effect: 'stacking_attack_boost', value: 4, emoji: '🩸', description: 'Each attack increases attack damage by 4% up to 20%' },
    { name: 'Fervor', effect: 'stacking_attack_speed', value: 10, emoji: '⚡', description: 'Each attack increases attack speed by 10, up to 30' },
    { name: 'Moment of Courage', effect: 'damage_counter', value: 100, emoji: '🛡️', description: '100% chance to block damage and counter with enemy attack damage, 2s cooldown' }
  ],
  3: [
    { name: 'Relentless Strike', effect: 'double_attack_chance', value: 35, emoji: '⚔️', description: '35% chance to attack immediately again after attacking' },
    { name: 'Vendetta', effect: 'death_revive', value: 50, emoji: '💀', description: 'After death, revive with 50% HP and can only deal basic attacks' },
    { name: 'Battle Trance', effect: 'low_health_lifesteal', value: 30, emoji: '🩸', description: 'Grants 30% lifesteal when below 50% HP for first time only' }
  ]
};
