import { StatsCalculator } from '../core/stats-calculator.js';
import { Economy } from './economy.js';
import { ArtifactEffects } from '../core/artifact-effects.js';
import { Tier3AbilitySelector } from '../components/tier3-ability-selector.js';

export class ItemShop {
  constructor(container, roundNumber = 1) {
    this.container = container;
    this.roundNumber = roundNumber;
    this.onShopComplete = null;
    this.itemSlots = [
      { item: null },
      { item: null },
      { item: null }
    ];
    this.purchasedItems = [];
    this.economy = new Economy();
    this.playerGold = 0;
    this.hasRerolledThisRound = false;
    this.globalRerollCost = 20;
    this.player = null;
    this.rerollCount = 0;
    this.onGoldChange = null;
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
    let tier = this.economy.generateItemTier(this.roundNumber);
    
    if (this.player) {
      const providenceBonus = ArtifactEffects.getProvidenceScepterBonus(this.player);
      const luckyDayBonus = ArtifactEffects.getLuckyDayBonus(this.player);
      
      const totalBonus = providenceBonus + (luckyDayBonus / 100);
      
      if (totalBonus > 0 && Math.random() < totalBonus) {
        tier = 3;
      }
    }
    
    return this.generateItemByTier(tier);
  }

  generateItemByTier(tier) {
    const tierCosts = { 1: 100, 2: 200, 3: 300 };
    const cost = tierCosts[tier];
    
    const itemTemplates = {
      1: [
        { name: 'Health Boost', stat: 'health', value: 300, emoji: '❤️', description: '+300 Health' },
        { name: 'Attack Power', stat: 'attack', value: 17, emoji: '⚔️', description: '+17 Attack' },
        { name: 'Speed Boost', stat: 'speed', value: 8, emoji: '💨', description: '+8 Speed' },
        { name: 'Armor Plating', stat: 'armor', value: 8, emoji: '🛡️', description: '+8% Physical Damage Reduction' },
        { name: 'Critical Strike', stat: 'critChance', value: 0.03, emoji: '💥', description: '+3% Crit Chance' },
        { name: 'Evasion Cloak', stat: 'evasionChance', value: 0.02, emoji: '👻', description: '+2% Evasion' }
      ],
      2: [
        { name: 'Vitality Ring', stat: 'health', value: 600, emoji: '💍', description: '+600 Health' },
        { name: 'Berserker Axe', stat: 'attack', value: 34, emoji: '🪓', description: '+34 Attack' },
        { name: 'Swift Boots', stat: 'speed', value: 15, emoji: '👢', description: '+15 Speed' },
        { name: 'Steel Armor', stat: 'armor', value: 15, emoji: '🛡️', description: '+15% Physical Damage Reduction' },
        { name: 'Precision Blade', stat: 'critChance', value: 0.05, emoji: '🗡️', description: '+5% Crit Chance' },
        { name: 'Shadow Mantle', stat: 'evasionChance', value: 0.04, emoji: '🌫️', description: '+4% Evasion' }
      ],
      3: [
        { name: 'Dragon Heart', stat: 'health', value: 900, emoji: '🐉', description: '+900 Health' },
        { name: 'Legendary Blade', stat: 'attack', value: 51, emoji: '⚔️', description: '+51 Attack' },
        { name: 'Wind Walker Boots', stat: 'speed', value: 25, emoji: '🌪️', description: '+25 Speed' },
        { name: 'Dragon Scale Armor', stat: 'armor', value: 25, emoji: '🐲', description: '+25% Physical Damage Reduction' },
        { name: 'Magic Resistance Cloak', stat: 'magicDamageReduction', value: 15, emoji: '🔮', description: '+15% Magic Damage Reduction' },
        { name: 'Berserker Ring', stat: 'physicalDamageAmplification', value: 10, emoji: '💪', description: '+10% Physical Damage Amplification' },
        { name: 'Arcane Focus', stat: 'magicDamageAmplification', value: 12, emoji: '✨', description: '+12% Magic Damage Amplification' },
        { name: 'Assassin\'s Edge', stat: 'critChance', value: 0.08, emoji: '🔪', description: '+8% Crit Chance' },
        { name: 'Phantom Cloak', stat: 'evasionChance', value: 0.06, emoji: '👤', description: '+6% Evasion' }
      ]
    };
    
    const templates = itemTemplates[tier];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return { ...template, cost, tier, tierName: `Tier ${tier}` };
  }

  rerollAllItems() {
    const effectiveRerollCost = this.getEffectiveRerollCost();
    
    if (this.hasRerolledThisRound || this.playerGold < effectiveRerollCost) {
      return false;
    }
    
    this.playerGold -= effectiveRerollCost;
    this.hasRerolledThisRound = true;
    this.rerollCount++;
    
    for (let i = 0; i < 3; i++) {
      this.itemSlots[i].item = this.generateRandomItem();
      this.updateSlotDisplay(i);
    }
    
    if (this.player) {
      ArtifactEffects.processFreeGiftReroll(this.player);
      ArtifactEffects.processBigSpenderReroll(this.player);
      
      const secondFree = ArtifactEffects.checkSecondFreeReroll(this.player);
      if (secondFree) {
        this.hasRerolledThisRound = false;
      }
    }
    
    if (this.onGoldChange) {
      this.onGoldChange(this.playerGold);
    }
    
    this.updateGoldDisplay();
    this.updateGlobalRerollButton();
    return true;
  }
  
  getEffectiveRerollCost() {
    let cost = this.globalRerollCost;
    
    if (this.player) {
      const discount = ArtifactEffects.getRerollDiscount(this.player);
      cost = Math.max(0, cost - discount);
      
      const fatePenalty = ArtifactEffects.getFateRerollPenalty(this.player);
      cost += fatePenalty;
    }
    
    return cost;
  }
  
  setPlayer(player) {
    this.player = player;
  }

  purchaseItem(slotIndex) {
    const slot = this.itemSlots[slotIndex];
    let itemCost = slot.item ? slot.item.cost : 0;
    
    if (this.player && ArtifactEffects.checkAndConsumeFreeGift(this.player)) {
      itemCost = 0;
    }
    
    if (slot.item && this.playerGold >= itemCost) {
      this.playerGold -= itemCost;
      this.purchasedItems.push(slot.item);
      slot.item = null;
      
      if (this.player) {
        const explorerGold = ArtifactEffects.processAbilityPurchase(this.player);
        if (explorerGold > 0) {
          this.playerGold += explorerGold;
        }
        
        const rebate = ArtifactEffects.processPurchase(this.player, itemCost);
        if (rebate > 0) {
          this.playerGold += rebate;
        }
      }
      
      if (this.onGoldChange) {
        this.onGoldChange(this.playerGold);
      }
      
      this.updateSlotDisplay(slotIndex);
      this.updateGoldDisplay();
      this.checkAndRefreshIfAllPurchased();
    }
  }

  checkAndRefreshIfAllPurchased() {
    const allItemsPurchased = this.itemSlots.every(slot => slot.item === null);
    if (allItemsPurchased) {
      this.refreshShopInventory();
    }
  }

  refreshShopInventory() {
    this.generateInitialItems();
    for (let i = 0; i < 3; i++) {
      this.updateSlotDisplay(i);
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
          <button class="action-button secondary" id="global-reroll-btn">
            Re-roll All (💰${this.globalRerollCost})
          </button>
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

    const globalRerollBtn = this.container.querySelector('#global-reroll-btn');
    if (globalRerollBtn) {
      globalRerollBtn.addEventListener('click', () => {
        this.rerollAllItems();
      });
    }

    this.itemSlots.forEach((slot, index) => {
      this.attachSlotEventListeners(index);
    });
  }

  attachSlotEventListeners(slotIndex) {
    const slotElement = this.container.querySelector(`[data-slot="${slotIndex}"]`);
    if (!slotElement) return;

    const purchaseBtn = slotElement.querySelector('.purchase-btn');

    if (purchaseBtn) {
      purchaseBtn.addEventListener('click', () => {
        this.purchaseItem(slotIndex);
        this.updatePurchasedItemsDisplay();
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
      } else if (item.stat === 'magicDamageReduction') {
        modifiedHero.stats.magicDamageReduction = (modifiedHero.stats.magicDamageReduction || 0) + item.value;
      } else if (item.stat === 'physicalDamageAmplification') {
        modifiedHero.stats.physicalDamageAmplification = (modifiedHero.stats.physicalDamageAmplification || 0) + item.value;
      } else if (item.stat === 'magicDamageAmplification') {
        modifiedHero.stats.magicDamageAmplification = (modifiedHero.stats.magicDamageAmplification || 0) + item.value;
      } else if (item.stat === 'critChance') {
        modifiedHero.stats.critChance += item.value;
      } else if (item.stat === 'evasionChance') {
        modifiedHero.stats.evasionChance += item.value;
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
    
    this.updateGlobalRerollButton();
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

  setOnGoldChange(callback) {
    this.onGoldChange = callback;
  }

  updateGlobalRerollButton() {
    const globalRerollBtn = this.container.querySelector('#global-reroll-btn');
    if (globalRerollBtn) {
      const effectiveCost = this.getEffectiveRerollCost();
      const canReroll = !this.hasRerolledThisRound && this.playerGold >= effectiveCost;
      globalRerollBtn.disabled = !canReroll;
      globalRerollBtn.textContent = this.hasRerolledThisRound 
        ? 'Re-roll Used This Round' 
        : `Re-roll All (💰${effectiveCost})`;
    }
  }

  resetForNewRound() {
    this.hasRerolledThisRound = false;
    this.refreshShopInventory();
    this.updateGlobalRerollButton();
  }
  
  checkAndShowTier3Selection() {
    if (!this.player) return;
    
    const goldenEggReady = ArtifactEffects.checkGoldenEggReady(this.player);
    const bigSpenderReady = ArtifactEffects.checkAndConsumeBigSpender(this.player);
    
    if (goldenEggReady || bigSpenderReady) {
      const title = goldenEggReady ? '🥚 Golden Egg Hatched!' : '💸 Big Spender Reward!';
      const subtitle = goldenEggReady ? 
        'Your Golden Egg has hatched! Choose a tier 3 ability' : 
        'You\'ve rerolled 15 times! Choose a tier 3 ability';
      
      const selector = new Tier3AbilitySelector();
      selector.setOnAbilitySelected((ability) => {
        if (this.shopType === 'abilities') {
          this.purchasedItems.push(ability);
          this.updatePurchasedItemsDisplay();
        }
        
        if (goldenEggReady) {
          ArtifactEffects.consumeGoldenEgg(this.player);
        }
      });
      
      selector.show(title, subtitle);
    }
  }
}
