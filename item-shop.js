import { StatsCalculator } from './stats-calculator.js';
import { Economy } from './economy.js';

export class ItemShop {
  constructor(container) {
    this.container = container;
    this.onShopComplete = null;
    this.itemSlots = [
      { item: null, rerollsLeft: 2 },
      { item: null, rerollsLeft: 2 },
      { item: null, rerollsLeft: 2 }
    ];
    this.purchasedItems = [];
    this.economy = new Economy();
    this.playerMoney = 0;
  }

  init() {
    this.generateInitialItems();
    this.render();
    this.attachEventListeners();
  }

  generateInitialItems() {
    for (let i = 0; i < 3; i++) {
      this.itemSlots[i].item = this.generateRandomItem();
    }
  }

  generateRandomItem() {
    const itemTypes = [
      { name: 'Health Boost', stat: 'health', value: 15, emoji: '❤️', description: '+15 Health', cost: 15 },
      { name: 'Attack Power', stat: 'attack', value: 8, emoji: '⚔️', description: '+8 Attack', cost: 20 },
      { name: 'Speed Boost', stat: 'speed', value: 5, emoji: '💨', description: '+5 Speed', cost: 18 },
      { name: 'Armor Plating', stat: 'armor', value: 6, emoji: '🛡️', description: '+6 Armor', cost: 16 },
      { name: 'Vitality Ring', stat: 'health', value: 25, emoji: '💍', description: '+25 Health', cost: 35 },
      { name: 'Berserker Axe', stat: 'attack', value: 12, emoji: '🪓', description: '+12 Attack', cost: 40 },
      { name: 'Swift Boots', stat: 'speed', value: 8, emoji: '👢', description: '+8 Speed', cost: 32 },
      { name: 'Dragon Scale', stat: 'armor', value: 10, emoji: '🐉', description: '+10 Armor', cost: 30 }
    ];

    return itemTypes[Math.floor(Math.random() * itemTypes.length)];
  }

  rerollSlot(slotIndex) {
    if (this.itemSlots[slotIndex].rerollsLeft > 0) {
      this.itemSlots[slotIndex].item = this.generateRandomItem();
      this.itemSlots[slotIndex].rerollsLeft--;
      this.updateSlotDisplay(slotIndex);
    }
  }

  purchaseItem(slotIndex) {
    const slot = this.itemSlots[slotIndex];
    if (slot.item && this.playerMoney >= slot.item.cost) {
      this.playerMoney -= slot.item.cost;
      this.purchasedItems.push(slot.item);
      slot.item = null;
      this.updateSlotDisplay(slotIndex);
      this.updateMoneyDisplay();
    }
  }

  updateSlotDisplay(slotIndex) {
    const slotElement = this.container.querySelector(`[data-slot="${slotIndex}"]`);
    if (slotElement) {
      slotElement.innerHTML = this.renderItemSlot(slotIndex);
      this.attachSlotEventListeners(slotIndex);
    }
  }

  renderItemSlot(slotIndex) {
    const slot = this.itemSlots[slotIndex];
    
    if (!slot.item) {
      return `
        <div class="item-slot empty">
          <div class="item-placeholder">Sold Out</div>
        </div>
      `;
    }

    const canAfford = this.playerMoney >= slot.item.cost;
    
    return `
      <div class="item-slot">
        <div class="item-header">
          <span class="item-emoji">${slot.item.emoji}</span>
          <span class="item-cost">💰${slot.item.cost}</span>
        </div>
        <div class="item-name">${slot.item.name}</div>
        <div class="item-description">${slot.item.description}</div>
        <div class="item-actions">
          <button class="action-button primary purchase-btn" data-slot="${slotIndex}" ${!canAfford ? 'disabled' : ''}>
            ${canAfford ? 'Buy' : 'Too Expensive'}
          </button>
          <button class="action-button secondary reroll-btn" data-slot="${slotIndex}" ${slot.rerollsLeft <= 0 ? 'disabled' : ''}>
            Reroll (${slot.rerollsLeft} left)
          </button>
        </div>
      </div>
    `;
  }

  render() {
    this.container.innerHTML = `
      <div class="item-shop-container">
        <div class="shop-header">
          <h1 class="shop-title">🏪 Item Shop</h1>
          <p class="shop-subtitle">Choose items to boost your hero's stats</p>
          <div class="player-money">💰 Money: <span id="money-display">${this.playerMoney}</span></div>
        </div>
        
        <div class="shop-items">
          ${this.itemSlots.map((slot, index) => `
            <div class="shop-slot" data-slot="${index}">
              ${this.renderItemSlot(index)}
            </div>
          `).join('')}
        </div>

        <div class="purchased-items">
          <h3>Purchased Items</h3>
          <div class="purchased-list" id="purchased-list">
            ${this.purchasedItems.length === 0 ? '<p class="no-items">No items purchased yet</p>' : this.renderPurchasedItems()}
          </div>
        </div>

        <div class="shop-controls">
          <button class="action-button primary" id="continue-tournament">Continue Tournament</button>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  renderPurchasedItems() {
    return this.purchasedItems.map(item => `
      <div class="purchased-item">
        <span class="item-emoji">${item.emoji}</span>
        <span class="item-name">${item.name}</span>
        <span class="item-effect">${item.description}</span>
      </div>
    `).join('');
  }

  attachEventListeners() {
    const continueBtn = this.container.querySelector('#continue-tournament');
    continueBtn.addEventListener('click', () => {
      if (this.onShopComplete) {
        this.onShopComplete(this.purchasedItems);
      }
    });

    this.itemSlots.forEach((slot, index) => {
      this.attachSlotEventListeners(index);
    });
  }

  attachSlotEventListeners(slotIndex) {
    const slotElement = this.container.querySelector(`[data-slot="${slotIndex}"]`);
    if (!slotElement) return;

    const purchaseBtn = slotElement.querySelector('.purchase-btn');
    const rerollBtn = slotElement.querySelector('.reroll-btn');

    if (purchaseBtn) {
      purchaseBtn.addEventListener('click', () => {
        this.purchaseItem(slotIndex);
        this.updatePurchasedItemsDisplay();
      });
    }

    if (rerollBtn && !rerollBtn.disabled) {
      rerollBtn.addEventListener('click', () => {
        this.rerollSlot(slotIndex);
      });
    }
  }

  updatePurchasedItemsDisplay() {
    const purchasedList = this.container.querySelector('#purchased-list');
    if (purchasedList) {
      purchasedList.innerHTML = this.purchasedItems.length === 0 ? 
        '<p class="no-items">No items purchased yet</p>' : 
        this.renderPurchasedItems();
    }
  }

  applyItemsToHero(hero) {
    const modifiedHero = { ...hero };
    
    this.purchasedItems.forEach(item => {
      if (item.stat === 'health') {
        modifiedHero.stats.health += item.value;
      } else if (item.stat === 'attack') {
        modifiedHero.stats.attack += item.value;
      } else if (item.stat === 'speed') {
        modifiedHero.stats.speed += item.value;
      } else if (item.stat === 'armor') {
        modifiedHero.stats.armor += item.value;
      }
    });

    return modifiedHero;
  }

  updateMoneyDisplay() {
    const moneyDisplay = this.container.querySelector('#money-display');
    if (moneyDisplay) {
      moneyDisplay.textContent = this.playerMoney;
    }
    
    this.itemSlots.forEach((slot, index) => {
      if (slot.item) {
        this.updateSlotDisplay(index);
      }
    });
  }

  setPlayerMoney(amount) {
    this.playerMoney = amount;
    this.updateMoneyDisplay();
  }

  setOnShopComplete(callback) {
    this.onShopComplete = callback;
  }
}
