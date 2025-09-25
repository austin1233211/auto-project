export const CRIT_SECT_ABILITIES = {
  1: [
    { name: 'Eagle Eye Boost', effect: 'crit_chance_boost', value: 4, emoji: '🦅', description: 'Increases base crit chance by 4%' },
    { name: 'Rage Resistance', effect: 'opponent_crit_resist', value: 18, emoji: '🛡️', description: 'Opponent has 18% chance to not perform critical strike when dealing damage' },
    { name: 'Unseen Rage', effect: 'evade_crit_boost', value: 2, emoji: '💥', description: 'Increases critical strike damage by 2% for every 3 evasion' },
    { name: 'Burst Blade', effect: 'crit_attack_boost', value: 6, emoji: '⚔️', description: 'Each time you trigger a crit, increase attack by 6 for 3 seconds' },
    { name: 'Burst Regen', effect: 'crit_heal', value: 20, emoji: '❤️', description: 'Each crit restores 20 HP' },
    { name: 'Burst Toxin', effect: 'crit_poison', value: 4, emoji: '☠️', description: 'Each crit applies 4 stacks of poison' },
    { name: 'Burst Frost', effect: 'crit_frost', value: 5, emoji: '❄️', description: 'Each crit applies 5 stacks of frost' },
    { name: 'Burst Magic', effect: 'crit_mana', value: 3, emoji: '🔮', description: 'Each crit gains 3 mana' },
    { name: 'Burst Shield', effect: 'crit_shield', value: 4, emoji: '🛡️', description: 'Each crit gains 4 stacks of shield' },
    { name: 'Body of Rage', effect: 'crit_temp_hp', value: 40, emoji: '💪', description: 'Each crit increases max HP by 40 (resets after round)' },
    { name: 'Critical Focus', effect: 'crit_chain_bonus', value: 3, emoji: '🎯', description: 'Each crit increases next crit chance by 3%, up to 15%' },
    { name: 'Lethal Precision', effect: 'crit_armor_pierce', value: 25, emoji: '🗡️', description: 'Critical hits ignore 25% of enemy armor' },
    { name: 'Lucky Strike', effect: 'crit_gold_bonus', value: 15, emoji: '💰', description: 'Critical hits grant 15% bonus gold at round end' },
    { name: 'Bloodlust', effect: 'crit_lifesteal', value: 8, emoji: '🩸', description: 'Critical hits heal for 8% of damage dealt' }
  ],
  2: [
    { name: 'Manablast', effect: 'magic_crit_chance', value: 25, emoji: '🌟', description: 'Magic damage can trigger critical strikes with 25% chance of current critical strike' },
    { name: 'Greater Bash', effect: 'crit_bonus_damage', value: 25, emoji: '💥', description: 'Deals an additional 25 damage when you hit a crit' },
    { name: 'Press the Attack', effect: 'crit_battle_start', value: 5, emoji: '⚡', description: 'Permanently gain 5% critical strike chance, increase crit chance by 4% for 5 seconds after round starts' }
  ],
  3: [
    { name: 'Source Detonation', effect: 'crit_ignore_shield', value: 60, emoji: '💥', description: 'Each crit has 60% chance to ignore shield stacks on opponent' },
    { name: 'Coup de Grace', effect: 'coup_de_grace', value: 80, emoji: '👑', description: 'Increase critical damage by 80%, at round start temporarily raises crit chance to 100% for 3 critical strikes' },
    { name: 'Blade Dance', effect: 'blade_dance', value: 5, emoji: '🗡️', description: 'Critical strikes stun opponent for 0.5s, dealing 5% of opponent HP ignoring shield, 1.5s cooldown' }
  ]
};
