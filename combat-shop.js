import { ItemShop } from './item-shop.js';

export class CombatShop extends ItemShop {
  constructor(container, combat) {
    super(container);
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
          <h3>🏪 Combat Shop</h3>
          <div class="player-money-mini">💰 ${this.playerMoney}</div>
          <button class="close-shop-btn" id="close-combat-shop">×</button>
        </div>
        <div class="shop-items-mini">
          ${this.itemSlots.map((slot, index) => `
            <div class="shop-slot-mini" data-slot="${index}">
              ${this.renderItemSlotMini(index)}
            </div>
          `).join('')}
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

    const canAfford = this.playerMoney >= slot.item.cost;
    const tooltipText = `${slot.item.name}: ${slot.item.description}`;
    
    return `
      <div class="item-slot-mini" title="${tooltipText}">
        <div class="item-emoji-mini">${slot.item.emoji}</div>
        <div class="item-name-mini">${slot.item.name}</div>
        <div class="item-cost-mini">💰${slot.item.cost}</div>
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

    this.itemSlots.forEach((slot, index) => {
      const buyBtn = this.container.querySelector(`[data-slot="${index}"] .buy-btn-mini`);
      if (buyBtn && !buyBtn.disabled) {
        buyBtn.addEventListener('click', () => {
          this.purchaseItem(index);
          this.updateMoneyDisplay();
          this.render();
        });
      }
    });
  }

  updateMoneyDisplay() {
    const moneyDisplay = this.container.querySelector('.player-money-mini');
    if (moneyDisplay) {
      moneyDisplay.textContent = `💰 ${this.playerMoney}`;
    }
  }
}
