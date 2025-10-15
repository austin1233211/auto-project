import { AbilitiesShop } from './abilities-shop.js';

export class CombatShop extends AbilitiesShop {
  constructor(container, combat, roundNumber = 1) {
    super(container, roundNumber);
    this.combat = combat;
    this.isVisible = false;
  }

  init() {
    this.generateInitialItems();
    this.render();
    this.attachEventListeners();
    this.hide();
  }

  render() {
    this.container.innerHTML = `
      <div class="combat-shop-widget">
        <div class="shop-header-mini">
          <h3>🏪 Abilities Shop</h3>
          <div class="player-gold-mini">💰 ${this.playerGold}</div>
          <button class="close-shop-btn" id="close-combat-shop">×</button>
        </div>
        <div class="shop-items-mini">
          ${this.itemSlots.map((slot, index) => `
            <div class="shop-slot-mini" data-slot="${index}">
              ${this.renderItemSlotMini(index)}
            </div>
          `).join('')}
        </div>
        <div class="shop-controls-mini">
          <button class="action-button secondary" id="global-reroll-btn">
            Re-roll All (💰${this.globalRerollCost})
          </button>
        </div>
      </div>
    `;
    this.attachEventListeners();
  }

  renderItemSlotMini(slotIndex) {
    const slot = this.itemSlots[slotIndex];

    if (!slot.item) {
      return `<div class="item-slot-mini empty">Sold Out</div>`;
    }

    const canAfford = this.playerGold >= slot.item.cost;
    const tooltipText = `${slot.item.name}: ${slot.item.description}`;

    return `
      <div class="item-slot-mini ${slot.item.tier ? `tier-${slot.item.tier}` : ''}">
        ${slot.item.tier ? `<div class="item-tier-badge-mini">T${slot.item.tier}</div>` : ''}
        <div class="item-info-container" title="${tooltipText}">
          <div class="item-emoji-mini">${slot.item.emoji}</div>
          <div class="item-name-mini">${slot.item.name}</div>
          <div class="item-cost-mini">💰${slot.item.cost}</div>
        </div>
        <button class="buy-btn-mini" data-slot="${slotIndex}" ${!canAfford ? 'disabled' : ''}>
          ${canAfford ? 'Buy' : 'No $'}
        </button>
      </div>
    `;
  }

  show() {
    this.isVisible = true;
    this.container.style.display = 'block';
  }

  hide() {
    this.isVisible = false;
    this.container.style.display = 'none';
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  attachEventListeners() {
    const closeBtn = this.container.querySelector('#close-combat-shop');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    const globalRerollBtn = this.container.querySelector('#global-reroll-btn');
    if (globalRerollBtn) {
      globalRerollBtn.addEventListener('click', () => {
        this.rerollAllItems();
        this.render();
        this.checkAndShowTier3Selection();
      });
    }

    this.itemSlots.forEach((slot, index) => {
      const buyBtn = this.container.querySelector(`[data-slot="${index}"] .buy-btn-mini`);
      if (buyBtn && !buyBtn.disabled) {
        buyBtn.addEventListener('click', () => {
          this.purchaseItem(index);
          this.updateGoldDisplay();
          this.updateSlotDisplay(index);
        });
      }
    });
  }

  updateSlotDisplay(slotIndex) {
    const slotElement = this.container.querySelector(`[data-slot="${slotIndex}"]`);
    if (slotElement) {
      slotElement.innerHTML = this.renderItemSlotMini(slotIndex);
      const buyBtn = slotElement.querySelector('.buy-btn-mini');
      if (buyBtn && !buyBtn.disabled) {
        buyBtn.addEventListener('click', () => {
          this.purchaseItem(slotIndex);
          this.updateGoldDisplay();
          this.updateSlotDisplay(slotIndex);
        });
      }
    }
  }

  updateGoldDisplay() {
    const goldDisplay = this.container.querySelector('.player-gold-mini');
    if (goldDisplay) {
      goldDisplay.textContent = `💰 ${this.playerGold}`;
    }
    this.updateGlobalRerollButton();
  }

  setPlayerGold(amount) {
    this.playerGold = amount;
    this.updateGoldDisplay();
  }

  purchaseItem(slotIndex) {
    super.purchaseItem(slotIndex);
    
    if (this.onGoldChange) {
      this.onGoldChange(this.playerGold);
    }
    
    if (this.onAbilityPurchased) {
      this.onAbilityPurchased();
    }
  }

  setOnGoldChange(callback) {
    this.onGoldChange = callback;
  }

  setOnAbilityPurchased(callback) {
    this.onAbilityPurchased = callback;
  }
}
