export class EquipmentReward {
  constructor(container) {
    this.container = container;
    this.currentEquipment = [];
    this.hasRerolled = false;
    this.onEquipmentSelected = null;
    this.selectedEquipment = null;
    this.playerWon = true;
  }

  init(playerWon = true) {
    this.playerWon = playerWon;
    this.generateEquipment();
    this.render();
    this.attachEventListeners();
  }

  generateEquipment() {
    const equipmentCount = this.playerWon ? 3 : 1;
    
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
        name: 'Wraith Pact',
        emoji: '🕯️',
        description: '+6 Shield stacks; after 3s, -35% enemy physical & magic damage until round end',
        type: 'wraith_pact',
        effects: { extraShieldStacks: 6, delayedEnemyDamageReduction: { delaySec: 3, physPct: 35, magicPct: 35 } }
      }
    ];
    const shuffled = [...equipmentTemplates].sort(() => Math.random() - 0.5);
    this.currentEquipment = shuffled.slice(0, equipmentCount).map(item => ({
      ...item,
      cost: 0,
      tier: Math.floor(Math.random() * 3) + 1,
      tierName: `Tier ${Math.floor(Math.random() * 3) + 1}`,
      type: 'equipment'
    }));
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
