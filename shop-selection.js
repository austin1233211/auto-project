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
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        this.playerGold = 1000;
        return;
      }

      const response = await fetch('http://localhost:8000/api/players/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const playerData = await response.json();
        this.playerGold = playerData.gold || 1000;
        this.playerInventory = playerData.items || [];
      } else {
        this.playerGold = 1000;
      }
    } catch (error) {
      console.error('Failed to load player data:', error);
      this.playerGold = 1000;
    }
  }

  async loadShopItems() {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await fetch('http://localhost:8000/api/shop/items', { headers });

      if (response.ok) {
        this.shopItems = await response.json();
      } else {
        this.shopItems = this.getMockShopItems();
      }
    } catch (error) {
      console.error('Failed to load shop items:', error);
      this.shopItems = this.getMockShopItems();
    }
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
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Please log in to purchase items');
        return;
      }

      const response = await fetch('http://localhost:8000/api/shop/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          item_id: itemId,
          quantity: 1
        })
      });

      const result = await response.json();

      if (result.success) {
        this.playerGold = result.new_gold_balance;
        alert(`Successfully purchased ${result.item_purchased.name}!`);
        await this.loadShopItems();
        this.render();
        this.attachEventListeners();
      } else {
        alert(`Purchase failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    }
  }

  setOnBackToHeroSelection(callback) {
    this.onBackToHeroSelection = callback;
  }
}
