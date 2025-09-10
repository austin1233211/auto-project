import { StatsCalculator } from './stats-calculator.js';
import { Economy } from './economy.js';

export class ItemShop {
  constructor(container, roundNumber = 1) {
    this.container = container;
    this.roundNumber = roundNumber;
    this.onShopComplete = null;
    this.itemSlots = [
      { item: null, rerollsLeft: 2 },
      { item: null, rerollsLeft: 2 },
      { item: null, rerollsLeft: 2 }
    ];
    this.purchasedItems = [];
    this.economy = new Economy();
    this.playerGold = 0;
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
    const tier = this.economy.generateItemTier(this.roundNumber);
    return this.generateItemByTier(tier);
  }

  generateItemByTier(tier) {
    const tierCosts = { 1: 100, 2: 200, 3: 300 };
    const cost = tierCosts[tier];
    
    const itemTemplates = {
      1: [
        { name: 'Health Boost', stat: 'health', value: 20, emoji: '❤️', description: '+20 Health' },
        { name: 'Attack Power', stat: 'attack', value: 10, emoji: '⚔️', description: '+10 Attack' },
        { name: 'Speed Boost', stat: 'speed', value: 8, emoji: '💨', description: '+8 Speed' },
        { name: 'Armor Plating', stat: 'armor', value: 8, emoji: '🛡️', description: '+8 Armor' }
      ],
      2: [
        { name: 'Vitality Ring', stat: 'health', value: 40, emoji: '💍', description: '+40 Health' },
        { name: 'Berserker Axe', stat: 'attack', value: 20, emoji: '🪓', description: '+20 Attack' },
        { name: 'Swift Boots', stat: 'speed', value: 15, emoji: '👢', description: '+15 Speed' },
        { name: 'Steel Armor', stat: 'armor', value: 15, emoji: '🛡️', description: '+15 Armor' }
      ],
      3: [
        { name: 'Dragon Heart', stat: 'health', value: 60, emoji: '🐉', description: '+60 Health' },
        { name: 'Legendary Blade', stat: 'attack', value: 30, emoji: '⚔️', description: '+30 Attack' },
        { name: 'Wind Walker Boots', stat: 'speed', value: 25, emoji: '🌪️', description: '+25 Speed' },
        { name: 'Dragon Scale Armor', stat: 'armor', value: 25, emoji: '🐲', description: '+25 Armor' }
      ]
    };
    
    const templates = itemTemplates[tier];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return { ...template, cost, tier, tierName: `Tier ${tier}` };
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
    if (slot.item && this.playerGold >= slot.item.cost) {
      this.playerGold -= slot.item.cost;
      this.purchasedItems.push(slot.item);
      slot.item = null;
      this.updateSlotDisplay(slotIndex);
      this.updateGoldDisplay();
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

    const canAfford = this.playerGold >= slot.item.cost;
    const tierClass = `tier-${slot.item.tier}`;
    
    return `
      <div class="item-slot ${tierClass}">
        <div class="item-tier-badge">T${slot.item.tier}</div>
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
          <div class="player-gold">💰 Gold: <span id="gold-display">${this.playerGold}</span></div>
          <div class="tier-info">Round ${this.roundNumber} - Higher tiers more likely in later rounds</div>
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

  updateGoldDisplay() {
    const goldDisplay = this.container.querySelector('#gold-display');
    if (goldDisplay) {
      goldDisplay.textContent = this.playerGold;
    }
    
    this.itemSlots.forEach((slot, index) => {
      if (slot.item) {
        this.updateSlotDisplay(index);
      }
    });
  }

  setPlayerGold(amount) {
    this.playerGold = amount;
    this.updateGoldDisplay();
  }

  setRoundNumber(roundNumber) {
    this.roundNumber = roundNumber;
  }

  setOnShopComplete(callback) {
    this.onShopComplete = callback;
  }
}
