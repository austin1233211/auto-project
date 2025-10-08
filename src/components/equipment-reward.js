export class EquipmentReward {
  constructor(container) {
    this.container = container;
    this.currentEquipment = [];
    this.hasRerolled = false;
    this.onEquipmentSelected = null;
    this.selectedEquipment = null;
    this.playerWon = true;
  }

  init(playerWon = true, currentRound = 1) {
    this.playerWon = playerWon;
    this.currentRound = currentRound;
    this.generateEquipment();
    this.render();
    this.attachEventListeners();
  }

  generateEquipment() {
    const equipmentCount = this.playerWon ? 3 : 1;

    const pickTierByRound = (round) => {
      const weights = (() => {
        if (round >= 15) return { 1: 10, 2: 60, 3: 30, 4: 0 };
        if (round >= 10) return { 1: 20, 2: 70, 3: 10, 4: 0 };
        return { 1: 70, 2: 30, 3: 0, 4: 0 };
      })();
      const tiers = Object.keys(weights).map(k => parseInt(k, 10));
      const total = tiers.reduce((s, t) => s + weights[t], 0);
      let r = Math.random() * total;
      for (const t of tiers) {
        if (r < weights[t]) return t;
        r -= weights[t];
      }
      return 1;
    };

    const tier1Types = [
      'arcane_ring','band_of_elvenskin','blightstone','claymore','faerie_fire','gauntlets_of_strength',
      'iron_branch','javelin','mango','maple_syrup','mekansm','pavise','poor_mans_shield',
      'sign_of_the_arachnid','spirit_vessel','urn_of_shadows','whisper_of_the_dead','winter_lotus'
    ];
    const tier2Types = [
      'ascetics_cap','blade_mail','poison_claw','crystalys','defiant_shell','diffusal_blade',
      'enchanted_quiver','shroud','ghost_scepter','hyper_frost','infused_raindrops','lotus_orb',
      'mana_staff','phylactery','soul_booster','spear_of_pursuit','talisman_of_evasion','vampire_fangs',
      'vanguard','wraith_pact'
    ];
    const tier3Types = [
      'archanist_armor','butterfly','daedalus','giant_slayer','heart_of_tarrasque','heavens_blade','kindle_staff',
      'lotus_antitoxic_capsule','magic_lamp','mind_breaker','minotaur_horn','monkey_king_bar','martyrs_plate',
      'orb_of_frost','orchid','revenant_brooch','shivas_guard','spell_prism','tricksters_cloak',
      'unwavering_condition','witch_blade','witless_shako'
    ];
    const tier4Types = [
      'abyssal_blade','disperser','heavens_halberd','gods_horn','parasma','pirate_hat','radiance','spell_blade','trident'
    ];
    const byTier = (templates, t) => {
      if (t === 1) return templates.filter(it => tier1Types.includes(it.type));
      if (t === 2) return templates.filter(it => tier2Types.includes(it.type));
      if (t === 3) return templates.filter(it => tier3Types.includes(it.type));
      if (t === 4) return templates.filter(it => tier4Types.includes(it.type));
      return [];
    };
    const fallbackFindByTier = (templates, target) => {
      let candidates = byTier(templates, target);
      if (candidates.length > 0) return candidates;
      for (let d = 1; d <= 3; d++) {
        if (target - d >= 1) {
          candidates = byTier(templates, target - d);
          if (candidates.length > 0) return candidates;
        }
        if (target + d <= 4) {
          candidates = byTier(templates, target + d);
          if (candidates.length > 0) return candidates;
        }
      }
      return templates;
    };
    
    const equipmentTemplates = [
      {
        name: 'Arcane Ring',
        emoji: '💠',
        description: '+6% Ultimate Damage; +2 mana/sec',
        type: 'arcane_ring',
        effects: { abilityEffectivenessPct: 6, manaPerSecond: 2 }
      },
      {
        name: 'Band of Elvenskin',
        emoji: '🧝',
        description: '+10% Physical Damage Reduction; Evade next physical hit every 4s',
        type: 'band_of_elvenskin',
        effects: { physicalDamageReductionPct: 10, evadePhysicalCooldownSec: 4 }
      },
      {
        name: 'Blightstone',
        emoji: '🪨',
        description: 'Deal 20 damage every 4s',
        type: 'blightstone',
        effects: { periodicDamage: { amount: 20, intervalSec: 4, damageType: 'physical' } }
      },
      {
        name: 'Claymore',
        emoji: '🗡️',
        description: '+6% Attack Speed',
        type: 'claymore',
        effects: { attackSpeedPct: 6 }
      },
      {
        name: 'Faerie Fire',
        emoji: '✨',
        description: '+120 Max HP; Restore 30 HP on taking a critical hit',
        type: 'faerie_fire',
        effects: { maxHpFlat: 120, healOnCritTaken: 30 }
      },
      {
        name: 'Gauntlets of Strength',
        emoji: '🥊',
        description: '+10% Critical Damage; Guaranteed crit every 4s',
        type: 'gauntlets_of_strength',
        effects: { critDamagePct: 10, guaranteedCritCooldownSec: 4 }
      },
      {
        name: 'Iron Branch',
        emoji: '🌿',
        description: '+120 Max HP',
        type: 'iron_branch',
        effects: { maxHpFlat: 120 }
      },
      {
        name: 'Javelin',
        emoji: '🏹',
        description: '+10% Attack Speed; 25% to deal +40 magic damage on hit',
        type: 'javelin',
        effects: { attackSpeedPct: 10, onHitMagicProc: { chancePct: 25, bonusDamage: 40 } }
      },
      {
        name: 'Mango',
        emoji: '🥭',
        description: '+6% Ultimate Damage; +20 mana at battle start',
        type: 'mango',
        effects: { abilityEffectivenessPct: 6, manaOnBattleStart: 20 }
      },
      {
        name: 'Maple Syrup',
        emoji: '🥞',
        description: '+50 Max HP; Each stack restores 10 HP and 2 mana every 3s; Gain 1 stack every 5 rounds (persistent)',
        type: 'maple_syrup',
        effects: { maxHpFlat: 50, perStack: { heal: 10, mana: 2, intervalSec: 3 }, stackGainRoundInterval: 5, persistent: true }
      },
      {
        name: 'Mekansm',
        emoji: '⚙️',
        description: '+1 Mana Regeneration; +100 Max HP; Restore 45 HP every 3s',
        type: 'mekansm',
        effects: { manaRegenPerSec: 1, maxHpFlat: 100, periodicHeal: { amount: 45, intervalSec: 3 } }
      },
      {
        name: 'Pavise',
        emoji: '🛡️',
        description: '+2 additional shield stacks; +100 Max HP; Once below 30% HP, gain 100 shield stacks (once per battle)',
        type: 'pavise',
        effects: { extraShieldStacks: 2, maxHpFlat: 100, shieldThreshold: { hpPct: 30, stacks: 100, oncePerBattle: true } }
      },
      {
        name: "Poor Man's Shield",
        emoji: '🪙',
        description: '+2 additional shield stacks; 12% to gain 8 shield stacks on physical damage taken',
        type: 'poor_mans_shield',
        effects: { extraShieldStacks: 2, onPhysicalDamageGainShield: { chancePct: 12, stacks: 8 } }
      },
      {
        name: 'Sign of the Arachnid',
        emoji: '🕷️',
        description: '+6 Attack; +4% Attack Speed per 300 HP lost',
        type: 'sign_of_the_arachnid',
        effects: { attackFlat: 6, attackSpeedPctPerHpLost: { amountPct: 4, hpPerStep: 300 } }
      },
      {
        name: 'Spirit Vessel',
        emoji: '🛍️',
        description: '+2 additional regeneration; Reduce enemy HP regeneration by 20%',
        type: 'spirit_vessel',
        effects: { extraRegenStacks: 2, enemyHealRegenReductionPct: 20 }
      },
      {
        name: 'Urn of Shadows',
        emoji: '🗳️',
        description: '+2 additional poison stacks; Apply 10 poison stacks every 4s; +3 poison stacks every 5 battles (persistent)',
        type: 'urn_of_shadows',
        effects: { extraPoisonStacks: 2, periodicApplyPoison: { stacks: 10, intervalSec: 4 }, persistentPoisonIncrement: { stacks: 3, battleInterval: 5 } }
      },
      {
        name: 'Whisper of the Dead',
        emoji: '💀',
        description: '+150 Max HP; When opponent casts ultimate, -15 mana regen for 2s',
        type: 'whisper_of_the_dead',
        effects: { maxHpFlat: 150, onEnemyUltimate: { manaRegenDelta: -15, durationSec: 2 } }
      },
      {
        name: 'Winter Lotus',
        emoji: '❄️',
        description: '+2 additional frost stacks; Below 30% HP, restore 200 HP and apply 100 frost stacks to opponent (once per battle)',
        type: 'winter_lotus',
        effects: { extraFrostStacks: 2, thresholdFrostBurst: { hpPct: 30, heal: 200, enemyFrostStacks: 100, oncePerBattle: true } }
      },
      {
        name: "Ascetic's Cap",
        emoji: '🎩',
        description: '+250 Max HP; -20% critical damage taken',
        type: 'ascetics_cap',
        effects: { maxHpFlat: 250, critDamageTakenReductionPct: 20 }
      },
      {
        name: 'Blade Mail',
        emoji: '🪓',
        description: '+6% Physical DR; +6% Magic DR; deal 40 dmg per 600 HP lost (+50% if HP < 50%)',
        type: 'blade_mail',
        effects: { physicalDamageReductionPct: 6, magicDamageReductionPct: 6, lostHpDamage: { perHp: 600, amount: 40, lowHpBonusPct: 50 } }
      },
      {
        name: 'Poison Claw',
        emoji: '🐾',
        description: '+4 Poison stacks; +12% Attack Speed; 20% on-hit triggers 1 poison tick',
        type: 'poison_claw',
        effects: { extraPoisonStacks: 4, attackSpeedPct: 12, onHitPoisonInstance: { chancePct: 20 } }
      },
      {
        name: 'Crystalys',
        emoji: '💎',
        description: '+3% Crit chance; +20% Crit damage',
        type: 'crystalys',
        effects: { critChancePct: 3, critDamagePct: 20 }
      },
      {
        name: 'Defiant Shell',
        emoji: '🐢',
        description: '+10% Attack damage; Counterattack for 50% attack (3s cd)',
        type: 'defiant_shell',
        effects: { attackDamagePct: 10, counterattack: { cooldownSec: 3, percentOfAttack: 50 } }
      },
      {
        name: 'Diffusal Blade',
        emoji: '🔪',
        description: '+15% Attack Speed; 60% on-hit burn 5 mana (1s cd)',
        type: 'diffusal_blade',
        effects: { attackSpeedPct: 15, manaBurnOnHit: { chancePct: 60, burn: 5, cooldownSec: 1 } }
      },
      {
        name: 'Enchanted Quiver',
        emoji: '🏹',
        description: '+30% Attack Speed; Next physical attack cannot be evaded and +80 magic (2s cd)',
        type: 'enchanted_quiver',
        effects: { attackSpeedPct: 30, unEvadableNext: { cooldownSec: 2, bonusMagic: 80 } }
      },
      {
        name: 'Shroud',
        emoji: '🧥',
        description: '+8% Magic DR; below 50% HP: x1.2 health regen and +20% Magic DR',
        type: 'shroud',
        effects: { magicDamageReductionPct: 8, lowHpBonuses: { thresholdPct: 50, extraMagicDrPct: 20, healthRegenMultiplier: 1.2 } }
      },
      {
        name: 'Ghost Scepter',
        emoji: '👻',
        description: '+12 additional poison stacks',
        type: 'ghost_scepter',
        effects: { extraPoisonStacks: 12 }
      },
      {
        name: 'Hyper Frost',
        emoji: '🧊',
        description: '+3 additional frost stacks',
        type: 'hyper_frost',
        effects: { extraFrostStacks: 3 }
      },
      {
        name: 'Infused Raindrops',
        emoji: '💧',
        description: '+10% Ultimate damage',
        type: 'infused_raindrops',
        effects: { abilityEffectivenessPct: 10 }
      },
      {
        name: 'Lotus Orb',
        emoji: '🌸',
        description: '+1.7 Mana regen; +9% Physical DR; reduce 30% of own frost/poison stacks every 2s',
        type: 'lotus_orb',
        effects: { manaRegenPerSec: 1.7, physicalDamageReductionPct: 9, periodicSelfPurge: { intervalSec: 2, percent: 30, stacks: ['frost', 'poison'] } }
      },
      {
        name: 'Mana Staff',
        emoji: '📏',
        description: '+2 Mana regen; 20% chance to free recast ultimate (no chaining)',
        type: 'mana_staff',
        effects: { manaRegenPerSec: 2, freeUltimate: { chancePct: 20 } }
      },
      {
        name: 'Phylactery',
        emoji: '🧪',
        description: '+3 Mana regen; +8% Ultimate damage; +140 magic on ultimate',
        type: 'phylactery',
        effects: { manaRegenPerSec: 3, abilityEffectivenessPct: 8, magicOnUlt: 140 }
      },
      {
        name: 'Soul Booster',
        emoji: '💜',
        description: '+80 Max HP; +30 Max HP per round after selection',
        type: 'soul_booster',
        effects: { maxHpFlat: 80, perRoundHpGain: 30 }
      },
      {
        name: 'Spear of Pursuit',
        emoji: '🗡️',
        description: '+4% Crit chance; +40 extra damage on crit',
        type: 'spear_of_pursuit',
        effects: { critChancePct: 4, extraDamageOnCrit: 40 }
      },
      {
        name: 'Talisman of Evasion',
        emoji: '🧿',
        description: '+3% Evasion; below 50% HP: +10% evasion',
        type: 'talisman_of_evasion',
        effects: { evasionChancePct: 3, lowHpExtraEvasionPct: 10, thresholdPct: 50 }
      },
      {
        name: 'Vampire Fangs',
        emoji: '🩸',
        description: '+6% Health regen; 12% on-hit heal 16 HP',
        type: 'vampire_fangs',
        effects: { healthRegenPct: 6, lifestealOnHit: { chancePct: 12, heal: 16 } }
      },
      {
        name: 'Vanguard',
        emoji: '🛡️',
        description: '+4 Shield stacks; +200 Max HP; 20% to gain 10 shield on physical damage taken',
        type: 'vanguard',
        effects: { extraShieldStacks: 4, maxHpFlat: 200, onPhysicalDamageGainShield: { chancePct: 20, stacks: 10 } }
      },
      {
        name: 'Wraith Pact',
        emoji: '🕯️',
        description: '+6 Shield stacks; after 3s, -35% enemy physical & magic damage until round end',
        type: 'wraith_pact',
        effects: { extraShieldStacks: 6, delayedEnemyDamageReduction: { delaySec: 3, physPct: 35, magicPct: 35 } }
      },
      {
        name: "Ascetic's Cap",
        emoji: '🎩',
        description: '+250 Max HP; -20% critical damage taken',
        type: 'ascetics_cap',
        effects: { maxHpFlat: 250, critDamageTakenReductionPct: 20 }
      },
      {
        name: 'Blade Mail',
        emoji: '🪓',
        description: '+6% Physical DR; +6% Magic DR; deal 40 dmg per 600 HP lost (+50% if HP < 50%)',
        type: 'blade_mail',
        effects: { physicalDamageReductionPct: 6, magicDamageReductionPct: 6, lostHpDamage: { perHp: 600, amount: 40, lowHpBonusPct: 50 } }
      },
      {
        name: 'Poison Claw',
        emoji: '🐾',
        description: '+4 Poison stacks; +12% Attack Speed; 20% on-hit triggers 1 poison tick',
        type: 'poison_claw',
        effects: { extraPoisonStacks: 4, attackSpeedPct: 12, onHitPoisonInstance: { chancePct: 20 } }
      },
      {
        name: 'Crystalys',
        emoji: '💎',
        description: '+3% Crit chance; +20% Crit damage',
        type: 'crystalys',
        effects: { critChancePct: 3, critDamagePct: 20 }
      },
      {
        name: 'Defiant Shell',
        emoji: '🐢',
        description: '+10% Attack damage; Counterattack for 50% attack (3s cd)',
        type: 'defiant_shell',
        effects: { attackDamagePct: 10, counterattack: { cooldownSec: 3, percentOfAttack: 50 } }
      },
      {
        name: 'Diffusal Blade',
        emoji: '🔪',
        description: '+15% Attack Speed; 60% on-hit burn 5 mana (1s cd)',
        type: 'diffusal_blade',
        effects: { attackSpeedPct: 15, manaBurnOnHit: { chancePct: 60, burn: 5, cooldownSec: 1 } }
      },
      {
        name: 'Enchanted Quiver',
        emoji: '🏹',
        description: '+30% Attack Speed; Next physical attack cannot be evaded and +80 magic (2s cd)',
        type: 'enchanted_quiver',
        effects: { attackSpeedPct: 30, unEvadableNext: { cooldownSec: 2, bonusMagic: 80 } }
      },
      {
        name: 'Shroud',
        emoji: '🧥',
        description: '+8% Magic DR; below 50% HP: x1.2 health regen and +20% Magic DR',
        type: 'shroud',
        effects: { magicDamageReductionPct: 8, lowHpBonuses: { thresholdPct: 50, extraMagicDrPct: 20, healthRegenMultiplier: 1.2 } }
      },
      {
        name: 'Ghost Scepter',
        emoji: '👻',
        description: '+12 additional poison stacks',
        type: 'ghost_scepter',
        effects: { extraPoisonStacks: 12 }
      },
      {
        name: 'Hyper Frost',
        emoji: '🧊',
        description: '+3 additional frost stacks',
        type: 'hyper_frost',
        effects: { extraFrostStacks: 3 }
      },
      {
        name: 'Infused Raindrops',
        emoji: '💧',
        description: '+10% Ultimate damage',
        type: 'infused_raindrops',
        effects: { abilityEffectivenessPct: 10 }
      },
      {
        name: 'Lotus Orb',
        emoji: '🌸',
        description: '+1.7 Mana regen; +9% Physical DR; reduce 30% of own frost/poison stacks every 2s',
        type: 'lotus_orb',
        effects: { manaRegenPerSec: 1.7, physicalDamageReductionPct: 9, periodicSelfPurge: { intervalSec: 2, percent: 30, stacks: ['frost', 'poison'] } }
      },
      {
        name: 'Mana Staff',
        emoji: '📏',
        description: '+2 Mana regen; 20% chance to free recast ultimate (no chaining)',
        type: 'mana_staff',
        effects: { manaRegenPerSec: 2, freeUltimate: { chancePct: 20 } }
      },
      {
        name: 'Phylactery',
        emoji: '🧪',
        description: '+3 Mana regen; +8% Ultimate damage; +140 magic on ultimate',
        type: 'phylactery',
        effects: { manaRegenPerSec: 3, abilityEffectivenessPct: 8, magicOnUlt: 140 }
      },
      {
        name: 'Soul Booster',
        emoji: '💜',
        description: '+80 Max HP; +30 Max HP per round after selection',
        type: 'soul_booster',
        effects: { maxHpFlat: 80, perRoundHpGain: 30 }
      },
      {
        name: 'Spear of Pursuit',
        emoji: '🗡️',
        description: '+4% Crit chance; +40 extra damage on crit',
        type: 'spear_of_pursuit',
        effects: { critChancePct: 4, extraDamageOnCrit: 40 }
      },
      {
        name: 'Talisman of Evasion',
        emoji: '🧿',
        description: '+3% Evasion; below 50% HP: +10% evasion',
        type: 'talisman_of_evasion',
        effects: { evasionChancePct: 3, lowHpExtraEvasionPct: 10, thresholdPct: 50 }
      },
      {
        name: 'Vampire Fangs',
        emoji: '🩸',
        description: '+6% Health regen; 12% on-hit heal 16 HP',
        type: 'vampire_fangs',
        effects: { healthRegenPct: 6, lifestealOnHit: { chancePct: 12, heal: 16 } }
      },
      {
        name: 'Vanguard',
        emoji: '🛡️',
        description: '+4 Shield stacks; +200 Max HP; 20% to gain 10 shield on physical damage taken',
        type: 'vanguard',
        effects: { extraShieldStacks: 4, maxHpFlat: 200, onPhysicalDamageGainShield: { chancePct: 20, stacks: 10 } }
      },
      {
        name: 'Archanist Armor',
        emoji: '🛡️',
        description: '+400 HP; +3% crit; 50% chance to reflect 40% of crit damage',
        type: 'archanist_armor',
        effects: { maxHpFlat: 400, critChancePct: 3, critReflect: { chancePct: 50, reflectPct: 40 } }
      },
      {
        name: 'Butterfly',
        emoji: '🦋',
        description: '+6% evasion; +15% attack speed; 30% to reduce damage by 1× evasion',
        type: 'butterfly',
        effects: { evasionChancePct: 6, attackSpeedPct: 15, onHitEvasionReduction: { chancePct: 30, multiplier: 1.0 } }
      },
      {
        name: 'Daedalus',
        emoji: '💥',
        description: '+40% crit dmg; +8% crit chance; +15 attack',
        type: 'daedalus',
        effects: { critDamagePct: 40, critChancePct: 8, attackFlat: 15 }
      },
      {
        name: 'Giant Slayer',
        emoji: '🪓',
        description: '+8% physical dmg; +2% per 600 opponent HP',
        type: 'giant_slayer',
        effects: { attackDamagePct: 8, perOpponentHpPhysAmp: { perHp: 600, pct: 2 } }
      },
      {
        name: 'Heart of Tarrasque',
        emoji: '❤️',
        description: '+400 HP; restore 1% max HP/sec; +20% health regen bonus',
        type: 'heart_of_tarrasque',
        effects: { maxHpFlat: 400, healPerSecondPctMaxHp: 1, healthRegenPct: 20 }
      },
      {
        name: "Heaven's Blade",
        emoji: '⚔️',
        description: '+15 attack; +200 HP; below 50% HP: -80% enemy physical damage for 2s (once)',
        type: 'heavens_blade',
        effects: { attackFlat: 15, maxHpFlat: 200, lowHpEnemyPhysReduce: { thresholdPct: 50, physPct: 80, durationSec: 2, once: true } }
      },
      {
        name: 'Kindle Staff',
        emoji: '🔥',
        description: '+200 HP; every 18% HP lost grants +6% damage reduction until round end',
        type: 'kindle_staff',
        effects: { maxHpFlat: 200, thresholdDrPerLoss: { pctLoss: 18, drPct: 6 } }
      },
      {
        name: 'Lotus Antitoxic Capsule',
        emoji: '💊',
        description: '+200 HP; +10 poison stacks; remove 25% of own poison every 0.8s',
        type: 'lotus_antitoxic_capsule',
        effects: { maxHpFlat: 200, extraPoisonStacks: 10, periodicSelfPoisonReduce: { pct: 25, intervalSec: 0.8 } }
      },
      {
        name: 'Magic Lamp',
        emoji: '🪔',
        description: '+10 health regen; +500 HP; below 20% HP: purge frost/poison and heal 500/s for 3s (once)',
        type: 'magic_lamp',
        effects: { extraRegenStacks: 10, maxHpFlat: 500, lowHpBurstHeal: { thresholdPct: 20, healPerSec: 500, durationSec: 3, purge: true, once: true } }
      },
      {
        name: 'Mind Breaker',
        emoji: '🧠',
        description: '+30% attack speed; on hit: stun 1.5s (4s cd)',
        type: 'mind_breaker',
        effects: { attackSpeedPct: 30, onHitStun: { durationSec: 1.5, cooldownSec: 4, chancePct: 100 } }
      },
      {
        name: 'Minotaur Horn',
        emoji: '🐂',
        description: '+10 attack; +10% AS; below 40% HP: purge frost/poison and -80% enemy magic dmg for 2s (once)',
        type: 'minotaur_horn',
        effects: { attackFlat: 10, attackSpeedPct: 10, lowHpEnemyMagicReduce: { thresholdPct: 40, magicPct: 80, durationSec: 2, purge: true, once: true } }
      },
      {
        name: 'Monkey King Bar',
        emoji: '🦍',
        description: '+20 attack; +20% AS; 35% to ignore evasion and deal 120 magic',
        type: 'monkey_king_bar',
        effects: { attackFlat: 20, attackSpeedPct: 20, onHitNoEvasion: { chancePct: 35, bonusMagic: 120 } }
      },
      {
        name: "Martyr's Plate",
        emoji: '🛡️',
        description: '+8 shield stacks; every 1s convert 10% damage taken into shield',
        type: 'martyrs_plate',
        effects: { extraShieldStacks: 8, periodicDamageToShield: { intervalSec: 1, pct: 10 } }
      },
      {
        name: 'Orb of Frost',
        emoji: '❄️',
        description: '+6 frost stacks; +2.5 mana regen; every 160 frost applied: deal 100 dmg',
        type: 'orb_of_frost',
        effects: { extraFrostStacks: 6, manaRegenPerSec: 2.5, frostThresholdDamage: { stacks: 160, damage: 100 } }
      },
      {
        name: 'Orchid',
        emoji: '🌸',
        description: '+3 mana regen; +8% magic amp; when enemy HP <60%: stun 1.5s',
        type: 'orchid',
        effects: { manaRegenPerSec: 3, magicDamageAmplificationPct: 8, hpThresholdStun: { enemyBelowPct: 60, durationSec: 1.5 } }
      },
      {
        name: 'Revenant Brooch',
        emoji: '🧿',
        description: '+30% AS; 50% to deal +15% attack damage',
        type: 'revenant_brooch',
        effects: { attackSpeedPct: 30, onHitBonusAttackPct: { chancePct: 50, pct: 15 } }
      },
      {
        name: "Shiva's Guard",
        emoji: '🧊',
        description: '+8% physical DR; +8 frost stacks; every 1s: +12 frost and deal stacks×25% magic',
        type: 'shivas_guard',
        effects: { physicalDamageReductionPct: 8, extraFrostStacks: 8, periodicFrostPulse: { intervalSec: 1, addStacks: 12, dmgPerStackPct: 25 } }
      },
      {
        name: 'Spell Prism',
        emoji: '🔮',
        description: '+10% ultimate damage; +4 mana regen; after ult: gain 10 mana',
        type: 'spell_prism',
        effects: { abilityEffectivenessPct: 10, manaRegenPerSec: 4, onUltGainMana: 10 }
      },
      {
        name: "Trickster's Cloak",
        emoji: '🃏',
        description: '+12% phys & magic DR; -9 frost/poison stacks applied to you',
        type: 'tricksters_cloak',
        effects: { physicalDamageReductionPct: 12, magicDamageReductionPct: 12, incomingStacksReduce: 9 }
      },
      {
        name: 'Unwavering Condition',
        emoji: '🧱',
        description: '+30% magic DR; -30% enemy ultimate damage',
        type: 'unwavering_condition',
        effects: { magicDamageReductionPct: 30, enemyUltDamageReducePct: 30 }
      },
      {
        name: 'Witch Blade',
        emoji: '🪄',
        description: '+20 poison stacks; +20% AS; +20% poison damage',
        type: 'witch_blade',
        effects: { extraPoisonStacks: 20, attackSpeedPct: 20, poisonDamageMultiplierPct: 20 }
      },
      {
        name: 'Witless Shako',
        emoji: '🎭',
        description: '+500 HP; every 800 max HP grants +1.6% phys & magic DR',
        type: 'witless_shako',
        effects: { maxHpFlat: 500, drPerHp: { perHp: 800, pct: 1.6 } }
      },
      {
        name: 'Abyssal Blade',
        emoji: '⛓️',
        description: '+20% AS; +50% stun resist; +200 HP; 25% to stun 0.6s (1.5s cd)',
        type: 'abyssal_blade',
        effects: { attackSpeedPct: 20, stunResistancePct: 50, maxHpFlat: 200, onHitStun: { chancePct: 25, durationSec: 0.6, cooldownSec: 1.5 } }
      },
      {
        name: 'Disperser',
        emoji: '🌊',
        description: '+30% AS; 60% chance to burn 8 mana (0.5s cd)',
        type: 'disperser',
        effects: { attackSpeedPct: 30, onHitManaBurn: { chancePct: 60, amount: 8, cooldownSec: 0.5 } }
      },
      {
        name: "Heaven's Halberd",
        emoji: '🪓',
        description: '+15 attack; +10% AS; below 50% HP: -80% enemy physical dmg and stun 2s (once)',
        type: 'heavens_halberd',
        effects: { attackFlat: 15, attackSpeedPct: 10, lowHpEnemyPhysReduceAndStun: { thresholdPct: 50, physPct: 80, stunSec: 2, once: true } }
      },
      {
        name: "God's Horn",
        emoji: '📯',
        description: '+15 attack; +15% AS; below 40% HP: purge frost/poison and stun-immune 2s',
        type: 'gods_horn',
        effects: { attackFlat: 15, attackSpeedPct: 15, lowHpPurgeAndStunImmune: { thresholdPct: 40, durationSec: 2 } }
      },
      {
        name: 'Parasma',
        emoji: '☣️',
        description: '+20 poison dmg per stack; +20% AS; +20% poison dmg; poison can crit',
        type: 'parasma',
        effects: { poisonPerStackBonus: 20, attackSpeedPct: 20, poisonDamageMultiplierPct: 20, poisonCanCrit: true }
      },
      {
        name: 'Pirate Hat',
        emoji: '🏴‍☠️',
        description: '+70% attack speed',
        type: 'pirate_hat',
        effects: { attackSpeedPct: 70 }
      },
      {
        name: 'Radiance',
        emoji: '🌟',
        description: '+10 attack; +4% evasion; every 1s deal (evasion×1.5) magic; enemies have +17% miss',
        type: 'radiance',
        effects: { attackFlat: 10, evasionChancePct: 4, periodicEvasionDamage: { intervalSec: 1, multiplier: 1.5 }, enemyMissChanceBonusPct: 17 }
      },
      {
        name: 'Spell Blade',
        emoji: '🗡️',
        description: '+15% ultimate dmg; +6 mana regen; after ult: +20 mana',
        type: 'spell_blade',
        effects: { abilityEffectivenessPct: 15, manaRegenPerSec: 6, onUltGainMana: 20 }
      },
      {
        name: 'Trident',
        emoji: '🔱',
        description: '+10% mag/phys amp & DR; +30% AS; +30 atk; +10 mana regen; +600 HP; +30% ult; +6% crit; +6% evasion; +10% lifesteal',
        type: 'trident',
        effects: { magicDamageAmplificationPct: 10, physicalDamageAmplificationPct: 10, magicDamageReductionPct: 10, physicalDamageReductionPct: 10, attackSpeedPct: 30, attackFlat: 30, manaRegenPerSec: 10, maxHpFlat: 600, abilityEffectivenessPct: 30, critChancePct: 6, evasionChancePct: 6, lifestealPct: 10 }
      },
    ];
    this.currentEquipment = [];
    for (let i = 0; i < equipmentCount; i++) {
      const desiredTier = pickTierByRound(this.currentRound || 1);
      const pool = fallbackFindByTier(equipmentTemplates, desiredTier);
      const item = pool[Math.floor(Math.random() * pool.length)];
      const labeledTier =
        tier1Types.includes(item.type) ? 1 :
        (tier2Types.includes(item.type) ? 2 :
        (tier3Types.includes(item.type) ? 3 :
        (tier4Types.includes(item.type) ? 4 : desiredTier)));
      this.currentEquipment.push({
        ...item,
        cost: 0,
        tier: labeledTier,
        tierName: `Tier ${labeledTier}`,
        type: 'equipment'
      });
    }
  }

  render() {
    const title = this.playerWon ? 'Victory Rewards!' : 'Consolation Prize';
    const subtitle = this.playerWon ? 
      'Choose one piece of equipment as your reward' : 
      'Choose one piece of equipment despite your defeat';

    this.container.innerHTML = `
      <div class="equipment-reward">
        <div class="reward-header">
          <h2>🏆 ${title}</h2>
          <p>${subtitle}</p>
        </div>
        
        <div class="equipment-grid">
          ${this.currentEquipment.map((equipment, index) => `
            <div class="equipment-slot tier-${equipment.tier}" data-index="${index}">
              <div class="equipment-info">
                <div class="equipment-header">
                  <span class="equipment-emoji">${equipment.emoji}</span>
                  <span class="equipment-name">${equipment.name}</span>
                </div>
                <div class="equipment-description">${equipment.description}</div>
                <div class="equipment-footer">
                  <span class="equipment-tier">${equipment.tierName}</span>
                  <span class="equipment-cost">✨ Free</span>
                </div>
              </div>
              <button class="select-equipment-button" data-index="${index}">
                Select Equipment
              </button>
            </div>
          `).join('')}
        </div>
        
        <div class="reward-actions">
          <button class="reroll-button" ${this.hasRerolled ? 'disabled' : ''}>
            🎲 Re-roll Equipment ${this.hasRerolled ? '(Used)' : ''}
          </button>
          <button class="confirm-selection-button" ${this.selectedEquipment ? '' : 'disabled'}>
            Confirm Selection
          </button>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const rerollButton = this.container.querySelector('.reroll-button');
    const confirmButton = this.container.querySelector('.confirm-selection-button');
    const selectButtons = this.container.querySelectorAll('.select-equipment-button');

    if (rerollButton && !this.hasRerolled) {
      rerollButton.addEventListener('click', () => {
        this.rerollEquipment();
      });
    }

    if (confirmButton) {
      confirmButton.addEventListener('click', () => {
        this.confirmSelection();
      });
    }

    selectButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.selectEquipment(index);
      });
    });
  }

  selectEquipment(index) {
    this.selectedEquipment = this.currentEquipment[index];
    
    this.container.querySelectorAll('.equipment-slot').forEach((slot, i) => {
      if (i === index) {
        slot.classList.add('selected');
      } else {
        slot.classList.remove('selected');
      }
    });

    const confirmButton = this.container.querySelector('.confirm-selection-button');
    if (confirmButton) {
      confirmButton.disabled = false;
    }
  }

  rerollEquipment() {
    if (this.hasRerolled) return;
    
    this.hasRerolled = true;
    this.selectedEquipment = null;
    this.generateEquipment();
    this.render();
    this.attachEventListeners();
  }

  confirmSelection() {
    if (this.selectedEquipment && this.onEquipmentSelected) {
      this.onEquipmentSelected(this.selectedEquipment);
    }
  }

  setOnEquipmentSelected(callback) {
    this.onEquipmentSelected = callback;
  }

  hide() {
    this.container.style.display = 'none';
  }

  show() {
    this.container.style.display = 'block';
  }
}
