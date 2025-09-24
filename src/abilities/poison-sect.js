export const POISON_SECT_ABILITIES = {
  1: [
    { name: 'Poison Aura', effect: 'poison_aura', value: 4, emoji: '☠️', description: 'Apply 4 stacks of poison every 1 second' },
    { name: 'Toxin Immunity', effect: 'poison_resistance', value: 8, emoji: '🛡️', description: 'Reduces 8% of poison damage' },
    { name: 'Arcane Toxin', effect: 'ultimate_poison', value: 30, emoji: '🔮', description: 'Each ultimate cast applies 30 poison stacks' },
    { name: 'Toxic Shield', effect: 'shield_poison_chance', value: 30, emoji: '🛡️', description: 'Each time when a shield stack is gained, 30% chance to apply 4 stacks of poison to opponent' },
    { name: 'Toxic Frost', effect: 'frost_poison_chance', value: 30, emoji: '❄️', description: 'Each time when frost is applied, 30% chance to apply 4 stacks of poison' },
    { name: 'Venomous Strike', effect: 'attack_poison_chance', value: 25, emoji: '⚔️', description: '25% chance to apply 3 poison stacks on attack' },
    { name: 'Toxic Blood', effect: 'damage_poison_reflect', value: 20, emoji: '🩸', description: '20% chance to apply 2 poison stacks when taking damage' },
    { name: 'Poison Mastery', effect: 'poison_damage_boost', value: 15, emoji: '💀', description: 'Increase poison damage by 15%' },
    { name: 'Noxious Presence', effect: 'poison_on_evade', value: 2, emoji: '👻', description: 'Apply 2 poison stacks when successfully evading' },
    { name: 'Toxic Regeneration', effect: 'poison_heal_conversion', value: 10, emoji: '💚', description: '10% of poison damage dealt heals you' },
    { name: 'Venom Sacs', effect: 'poison_stack_bonus', value: 1, emoji: '🟢', description: 'All poison applications gain +1 additional stack' },
    { name: 'Corrosive Touch', effect: 'crit_poison_chance', value: 40, emoji: '💥', description: '40% chance to apply 3 poison stacks on critical hits' },
    { name: 'Toxic Immunity', effect: 'poison_status_immunity', value: 50, emoji: '✨', description: '50% chance to be immune to poison effects' },
    { name: 'Plague Bearer', effect: 'poison_spread_chance', value: 15, emoji: '🦠', description: '15% chance for poison to spread additional stacks to opponent' }
  ],
  2: [
    { name: 'Corrosive Toxin', effect: 'damage_poison_chance', value: 30, emoji: '🧪', description: '30% chance to apply 8 stacks of poison when taking damage' },
    { name: 'Pre-battle Toxicant', effect: 'battle_start_poison', value: 100, emoji: '💀', description: 'Apply 100 stacks of poison to opponent when round begins' },
    { name: 'Toxic Tearing', effect: 'deal_damage_poison_chance', value: 30, emoji: '🗡️', description: '30% chance to apply 8 stacks of poison when dealing damage to opponent' }
  ],
  3: [
    { name: 'Plague', effect: 'low_hp_poison_burst', value: 400, emoji: '🦠', description: 'When HP falls below 40%, apply 400 stacks of poison to opponent, once per round' },
    { name: 'Nethertoxin', effect: 'poison_decay_resist', value: 30, emoji: '👹', description: 'Poison stacks have 30% chance to not reduce in number of stacks' },
    { name: 'Pestilent Husk', effect: 'self_poison_reflect', value: 40, emoji: '💀', description: 'Applies 40 poison stacks to yourself, every stack of poison you have deals same damage to opponent' }
  ]
};
