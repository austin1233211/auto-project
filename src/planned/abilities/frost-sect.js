export const FROST_SECT_ABILITIES = {
  1: [
    { name: 'Lasting Freeze', effect: 'frost_aura', value: 6, emoji: '❄️', description: 'Applies 6 stacks of frost every 1 second' },
    { name: 'Frost Immunity', effect: 'frost_resistance', value: 18, emoji: '🛡️', description: '18% chance the opponents frost stacks application on you will fail' },
    { name: 'Frost Strike', effect: 'attack_frost', value: 5, emoji: '⚔️', description: '60% chance to apply 5 stacks of frost with each attack' },
    { name: 'Unseen Frost', effect: 'evade_frost', value: 4, emoji: '👻', description: 'Applies 4 stacks of frost with each evasion' },
    { name: 'Burst Frost', effect: 'crit_frost', value: 5, emoji: '💥', description: 'With each crit, apply 5 stacks of frost to opponent' },
    { name: 'Blood of the Frozen', effect: 'hp_loss_frost', value: 0.3, emoji: '🩸', description: 'Every 1.5 seconds apply frost stacks equal to 0.3% of HP lost, minimum 3 to opponent' },
    { name: 'Freezing Healing', effect: 'heal_frost_chance', value: 35, emoji: '💚', description: '35% chance to apply 5 stacks of frost to opponent when you restore HP' },
    { name: 'Arcane Frost', effect: 'ultimate_frost', value: 20, emoji: '🔮', description: 'Each ultimate you cast applies 20 stacks of frost' },
    { name: 'Frost Shield', effect: 'shield_frost_chance', value: 30, emoji: '🛡️', description: 'Each time when a shield stack is gained, 30% chance to inflict 4 stacks of frost on opponent' },
    { name: 'Toxic Frost', effect: 'frost_poison_chance', value: 30, emoji: '☠️', description: 'Each time when frost is applied, 30% chance to apply 4 stacks of poison' },
    { name: 'Glacial Armor', effect: 'frost_damage_reduction', value: 12, emoji: '🧊', description: 'Reduce damage taken by 1% for every 10 frost stacks on opponent' },
    { name: 'Winter\'s Grasp', effect: 'frost_slow_aura', value: 8, emoji: '🌨️', description: 'Nearby enemies move 8% slower for each frost stack they have' },
    { name: 'Permafrost', effect: 'frost_stack_bonus', value: 2, emoji: '🏔️', description: 'All frost applications gain +2 additional stacks' },
    { name: 'Icy Veins', effect: 'frost_mana_boost', value: 15, emoji: '💙', description: 'Gain 15% more mana when applying frost stacks' }
  ],
  2: [
    { name: 'Bone Chill', effect: 'frost_damage_chance', value: 30, emoji: '💀', description: '30% chance to deal 30 magic damage when inflicting frost stacks on opponent' },
    { name: 'Ice Enchantment', effect: 'damage_frost_chance', value: 33, emoji: '🧊', description: 'When taking damage, 33% chance to apply 12 frost stacks to opponent' },
    { name: 'Cold Snap', effect: 'battle_start_frost', value: 80, emoji: '❄️', description: 'Applies 80 frost stacks to opponent on round start' }
  ],
  3: [
    { name: 'Frost Nova', effect: 'frost_nova_damage', value: 180, emoji: '💥', description: 'Deal damage every 2 seconds, [180 + current frost stacks on opponent * 1]' },
    { name: 'Frostbite', effect: 'frostbite_stun', value: 80, emoji: '🧊', description: 'Stuns opponent for 1.2 seconds when round starts, deals 80 magic damage every 0.8 seconds applying 20 stacks of frost' },
    { name: 'Cold Embrace', effect: 'cold_embrace_defense', value: 70, emoji: '🤗', description: 'When HP falls below 25%, increase damage reduction by 70%, restore [120 + opponents frost stacks * 40%] HP every 3 seconds, applies 48 stacks of frost, lasts for 3 seconds' }
  ]
};
