export const HEALTH_SECT_ABILITIES = {
  1: [
    { name: 'Body of Sturdiness', effect: 'health_boost', value: 200, emoji: '💪', description: 'Gain 200 HP' },
    { name: 'Energy Defuser', effect: 'opponent_health_reduction', value: 8, emoji: '🛡️', description: 'Reduce opponent health sect abilities by 8%' },
    { name: 'Body of Regen', effect: 'health_regen_percent', value: 1, emoji: '❤️', description: 'Every 1.2 seconds restore 1% HP' },
    { name: 'Blood of Toxin', effect: 'hp_loss_poison', value: 0.3, emoji: '☠️', description: 'Every 1.5s apply poison stacks equal to 0.3% of HP lost, minimum 3 to opponent' },
    { name: 'Blood of the Frozen', effect: 'hp_loss_frost', value: 0.3, emoji: '❄️', description: 'Every 1.5s apply frost stacks equal to 0.3% of HP lost, minimum 3 to opponent' },
    { name: 'Blood Shield', effect: 'hp_loss_shield', value: 0.3, emoji: '🛡️', description: 'Every 1.5s gain shield stacks equal to 0.3% of HP lost, minimum 3 to self' },
    { name: 'Vitality Surge', effect: 'health_percentage_boost', value: 12, emoji: '💖', description: '+12% maximum health' },
    { name: 'Hardy Constitution', effect: 'health_regen_flat', value: 3, emoji: '💚', description: 'Regenerate 3 health per second' },
    { name: 'Life Force', effect: 'health_on_kill', value: 25, emoji: '⚡', description: 'Restore 25 health when killing an enemy' },
    { name: 'Thick Hide', effect: 'damage_reduction', value: 6, emoji: '🛡️', description: 'Reduce all damage taken by 6%' },
    { name: 'Second Wind', effect: 'low_health_regen', value: 4, emoji: '🌪️', description: 'Regenerate 4 HP/sec when below 50% health' },
    { name: 'Endurance Training', effect: 'health_armor_bonus', value: 2, emoji: '🏃', description: '+2 armor for every 100 max health' },
    { name: 'Iron Will', effect: 'health_status_resist', value: 20, emoji: '🧠', description: '20% resistance to all debuffs' },
    { name: 'Survivor Instinct', effect: 'health_on_crit', value: 18, emoji: '💥', description: 'Heal 18 HP on critical hits' }
  ],
  2: [
    { name: 'Blood Strike', effect: 'hp_damage_aura', value: 2, emoji: '🩸', description: 'Deal physical damage equal to 2% of self max HP to opponent every 1.2 seconds' },
    { name: 'Unyielding Spirit', effect: 'hp_loss_damage_reduction', value: 1.5, emoji: '🛡️', description: 'For every 800 HP lost, increase damage reduction by 1.5% up to 8% max' },
    { name: 'Beastial Blood', effect: 'health_percentage_boost_major', value: 15, emoji: '🐺', description: 'Increase HP by 15%' }
  ],
  3: [
    { name: 'Life Break', effect: 'hp_sacrifice_damage', value: 20, emoji: '💀', description: 'When round starts, deal 20% of your HP to opponent and deal that damage to yourself' },
    { name: 'Drums of Slom', effect: 'hp_magic_damage_growth', value: 6, emoji: '🥁', description: 'Every 2s, deal magic damage equal to 6% of max HP to opponent, increase own max HP by 200 every 2s up to 1000 HP max' },
    { name: 'Immortal Essence', effect: 'health_death_immunity', value: 5, emoji: '✨', description: 'Immune to death for 5 seconds, heal to full when immunity ends' }
  ]
};
