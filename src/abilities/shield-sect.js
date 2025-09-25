export const SHIELD_SECT_ABILITIES = {
  1: [
    { name: 'Lasting Guard', effect: 'shield_aura', value: 4, emoji: '🛡️', description: 'Grants 4 stacks of shield every 1 second' },
    { name: 'Shield Destruction', effect: 'shield_resistance', value: 18, emoji: '💥', description: '18% chance for the opponents shield gain to fail' },
    { name: 'Bulwark', effect: 'attack_shield', value: 4, emoji: '⚔️', description: '60% chance to gain 4 stacks of shield with each attack' },
    { name: 'Unseen Shield', effect: 'evade_shield', value: 4, emoji: '👻', description: 'Gains 4 stacks of shield with each evasion' },
    { name: 'Burst Shield', effect: 'crit_shield', value: 4, emoji: '💥', description: 'With each crit, gain 4 stacks of shield' },
    { name: 'Blood Shield', effect: 'hp_loss_shield', value: 0.3, emoji: '🩸', description: 'Every 1.5 seconds, grants shield equal to 0.3% of HP lost, minimum 3' },
    { name: 'Healing Shield', effect: 'heal_shield_chance', value: 25, emoji: '💚', description: '25% chance to gain 4 stacks of shield when HP is restored' },
    { name: 'Arcane Shield', effect: 'ultimate_shield', value: 15, emoji: '🔮', description: 'Each ultimate cast grants 15 stacks of shield' },
    { name: 'Toxic Shield', effect: 'shield_poison_chance', value: 30, emoji: '☠️', description: 'Each time when a shield is gained, 30% chance to apply 4 stacks of poison to opponent' },
    { name: 'Frost Shield', effect: 'shield_frost_chance', value: 30, emoji: '❄️', description: 'Each time when a shield is gained, 30% chance to inflict 4 stacks of frost to opponent' },
    { name: 'Shield Mastery', effect: 'shield_effectiveness', value: 20, emoji: '🏆', description: 'Increase shield damage reduction by 20%' },
    { name: 'Barrier Regeneration', effect: 'shield_regen', value: 2, emoji: '🔄', description: 'Regenerate 2 shield stacks every 3 seconds' },
    { name: 'Deflection', effect: 'shield_reflect_chance', value: 15, emoji: '↩️', description: '15% chance to reflect 50% of blocked damage back to attacker' },
    { name: 'Shield Wall', effect: 'shield_damage_bonus', value: 8, emoji: '🧱', description: 'Deal 8% more damage for every 10 shield stacks you have' }
  ],
  2: [
    { name: 'Defense Mastery', effect: 'battle_start_shield', value: 10, emoji: '🛡️', description: 'Gains 10 shield on round start' },
    { name: 'Shield Strike', effect: 'shield_damage_chance', value: 25, emoji: '⚔️', description: 'Each time when a shield is gained, 25% chance to strike opponent dealing 40 physical damage' },
    { name: 'Kraken Shell', effect: 'high_damage_shield', value: 8, emoji: '🐙', description: 'When taking damage exceeding 80 damage in a single hit, gain 8 stacks of shield' }
  ],
  3: [
    { name: 'Final Defense', effect: 'death_immunity_shield', value: 1200, emoji: '💀', description: 'Immune to death once per round, immediately gain 1200 stacks of shield, this shield does not decay until 2 seconds have passed' },
    { name: 'Aphotic Shield', effect: 'status_shield_cleanse', value: 20, emoji: '🌟', description: 'Reduces poison and frost stacks applied to you from enemies by 20%, for every 200 shield lost remove 10% of poison and/or frost stacks on you' },
    { name: 'Reactive Tazer', effect: 'shield_loss_damage', value: 50, emoji: '⚡', description: 'Every 1.8 seconds, deals magic damage equal to [shield lost during the 1.8 seconds * 50%] and grants a shield equal to 15% of the shield lost during this period' }
  ]
};
