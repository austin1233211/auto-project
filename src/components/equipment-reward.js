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
