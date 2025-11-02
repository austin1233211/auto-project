export const EVADE_SECT_ABILITIES = {
  1: [
    { name: 'Alacrity Boost', effect: 'evasion_boost', value: 2, emoji: '💨', description: 'Increase base evasion by 2' },
    { name: 'Agile Shackles', effect: 'ignore_enemy_evade', value: 18, emoji: '⛓️', description: '18% chance to ignore opponent evade' },
    { name: 'Unseen Blade', effect: 'evasion_attack_bonus', value: 1, emoji: '👻', description: 'Grants 1% of attack damage for every 3 base evasion' },
    { name: 'Unseen Toxin', effect: 'evade_poison', value: 4, emoji: '☠️', description: 'Applies 4 poison stacks with each evade' },
    { name: 'Unseen Frost', effect: 'evade_frost', value: 5, emoji: '❄️', description: 'Applies 5 frost stacks with each evade' },
    { name: 'Unseen Magic', effect: 'evade_mana', value: 3, emoji: '🔮', description: 'Regenerates 3 mana with each evade' },
    { name: 'Unseen Healing', effect: 'evade_heal', value: 10, emoji: '❤️', description: 'Restores 10 HP with each evade' },
    { name: 'Unseen Shield', effect: 'evade_shield', value: 4, emoji: '🛡️', description: 'Gains 4 stacks of shield with each evade' },
    { name: 'Unseen Rage', effect: 'evade_crit_boost', value: 2, emoji: '💥', description: 'Increases critical strike damage by 2% for every 3 evasion' }
  ],
  2: [
    { name: 'Magic Deviation', effect: 'magic_evade', value: 25, emoji: '🌟', description: 'Magic damage can be evaded with chance equal to 25% of current evasion' },
    { name: 'Unseen Counter Attack', effect: 'evade_damage_reflect', value: 12, emoji: '🔄', description: 'Deals 12% of damage back to enemy hero with every evade' },
    { name: 'Windrun', effect: 'battle_start_evasion', value: 5, emoji: '💨', description: 'Grant 5 evasion, increase evasion by 2 for 5 seconds after battle starts' }
  ],
  3: [
    { name: 'Mischief', effect: 'damage_block_chance', value: 6, emoji: '✨', description: 'Base 6% + 20% of current evasion rate chance to block all damage, 1s cooldown' },
    { name: 'Dispersion', effect: 'evasion_damage_reduction', value: 20, emoji: '🛡️', description: '+20% evasion damage reduction, 60% chance to deal 40 + 60% damage taken to enemy on failed evade' },
    { name: 'Holy Reflection', effect: 'evade_reflect', value: 50, emoji: '✨', description: 'On evasion, 50% chance to reflect incoming damage, once per round' }
  ]
};
