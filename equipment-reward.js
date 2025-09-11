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
      { name: 'Iron Sword', stat: 'attack', value: 20, emoji: '⚔️', description: '+20 Attack Power' },
      { name: 'Steel Shield', stat: 'armor', value: 15, emoji: '🛡️', description: '+15 Armor' },
      { name: 'Health Potion', stat: 'health', value: 80, emoji: '❤️', description: '+80 Health' },
      { name: 'Swift Boots', stat: 'speed', value: 12, emoji: '👢', description: '+12 Speed' },
      { name: 'Magic Ring', stat: 'magicDamageAmplification', value: 15, emoji: '💍', description: '+15% Magic Damage' },
      { name: 'Lucky Charm', stat: 'critChance', value: 18, emoji: '🍀', description: '+18% Critical Hit Chance' },
      { name: 'Cloak of Evasion', stat: 'evasionChance', value: 15, emoji: '👤', description: '+15% Evasion Chance' },
      { name: 'Power Gauntlets', stat: 'physicalDamageAmplification', value: 12, emoji: '🥊', description: '+12% Physical Damage' },
      { name: 'Mage Robes', stat: 'magicDamageReduction', value: 20, emoji: '👘', description: '+20% Magic Resistance' },
      { name: 'Berserker Axe', stat: 'attack', value: 25, emoji: '🪓', description: '+25 Attack Power' }
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
