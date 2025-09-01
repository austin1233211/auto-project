export class ShopSelection {
  constructor(container) {
    this.container = container;
    this.selectedCategory = 'all';
    this.playerGold = 0;
    this.shopItems = [];
    this.playerInventory = [];
    this.onBackToHeroSelection = null;
    this.init();
  }

  async init() {
    await this.loadPlayerData();
    await this.loadShopItems();
    this.render();
    this.attachEventListeners();
  }

  async loadPlayerData() {
    this.playerGold = 1000;
    this.playerInventory = [];
  }

  async loadShopItems() {
    this.shopItems = this.getMockShopItems();
  }

  getMockShopItems() {
    return [
      {
        id: "damage_boost_1",
        name: "Minor Damage Boost",
        description: "Increases all ability damage by 10%",
        category: "ability_upgrade",
        price: 50,
        rarity: "common",
        available: this.playerGold >= 50,
        owned_quantity: 0
      },
      {
        id: "health_boost_1",
        name: "Vitality Potion",
        description: "Permanently increases max health by 25",
        category: "stat_boost",
        price: 80,
        rarity: "common",
        available: this.playerGold >= 80,
        owned_quantity: 0
      },
      {
        id: "legendary_might",
        name: "Legendary Might",
        description: "Massive boost: +50 health, +20 attack, +10 speed",
        category: "stat_boost",
        price: 500,
        rarity: "legendary",
        available: this.playerGold >= 500,
        owned_quantity: 0
      }
    ];
  }

  render() {
    const filteredItems = this.selectedCategory === 'all' 
      ? this.shopItems 
      : this.shopItems.filter(item => item.category === this.selectedCategory);

    this.container.innerHTML = `
      <div class="shop-selection-container">
        <h1 class="shop-selection-title">🛒 Gladiator Shop</h1>
        
        <div class="player-gold">
          💰 Gold: ${this.playerGold}
        </div>
        
        <div class="shop-categories">
          ${this.renderCategoryTabs()}
        </div>
        
        <div class="shop-items-grid">
          ${filteredItems.map(item => this.renderShopItem(item)).join('')}
        </div>
        
        <div class="shop-controls">
          <button class="action-button secondary" id="back-to-hero-selection">
            ← Back to Hero Selection
          </button>
        </div>
      </div>
    `;
  }

  renderCategoryTabs() {
    const categories = [
      { id: 'all', name: 'All Items', icon: '🛍️' },
      { id: 'ability_upgrade', name: 'Abilities', icon: '⚡' },
      { id: 'stat_boost', name: 'Stats', icon: '💪' },
      { id: 'consumable', name: 'Consumables', icon: '🧪' }
    ];

    return categories.map(category => `
      <button class="category-tab ${this.selectedCategory === category.id ? 'active' : ''}" 
              data-category="${category.id}">
        ${category.icon} ${category.name}
      </button>
    `).join('');
  }

  renderShopItem(item) {
    const affordableClass = item.available ? '' : ' unaffordable';
    const rarityClass = `rarity-${item.rarity}`;

    return `
      <div class="shop-item-card${affordableClass}" data-item-id="${item.id}">
        <div class="item-header">
          <div class="item-rarity ${rarityClass}">${item.rarity.toUpperCase()}</div>
          <div class="item-owned">Owned: ${item.owned_quantity || 0}</div>
        </div>
        
        <div class="item-name">${item.name}</div>
        <div class="item-description">${item.description}</div>
        
        <div class="item-footer">
          <div class="item-price">💰 ${item.price} Gold</div>
          <button class="purchase-btn ${!item.available ? 'disabled' : ''}" 
                  data-item-id="${item.id}"
                  ${!item.available ? 'disabled' : ''}>
            ${item.available ? 'Purchase' : 'Cannot Afford'}
          </button>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    this.container.addEventListener('click', (e) => {
      const categoryTab = e.target.closest('.category-tab');
      if (categoryTab) {
        const categoryId = categoryTab.dataset.category;
        this.selectCategory(categoryId);
        return;
      }

      const purchaseBtn = e.target.closest('.purchase-btn');
      if (purchaseBtn && !purchaseBtn.disabled) {
        const itemId = purchaseBtn.dataset.itemId;
        this.purchaseItem(itemId);
        return;
      }

      const backBtn = e.target.closest('#back-to-hero-selection');
      if (backBtn && this.onBackToHeroSelection) {
        this.onBackToHeroSelection();
        return;
      }
    });
  }

  selectCategory(categoryId) {
    this.selectedCategory = categoryId;
    this.render();
    this.attachEventListeners();
  }

  async purchaseItem(itemId) {
    const item = this.shopItems.find(i => i.id === itemId);
    if (!item || !item.available) {
      alert('Cannot purchase this item');
      return;
    }

    if (this.playerGold >= item.price) {
      this.playerGold -= item.price;
      item.owned_quantity = (item.owned_quantity || 0) + 1;
      alert(`Successfully purchased ${item.name}!`);
      this.render();
      this.attachEventListeners();
    } else {
      alert('Not enough gold!');
    }
  }

  setOnBackToHeroSelection(callback) {
    this.onBackToHeroSelection = callback;
  }
}
