export class HeroInventoryWidget {
  constructor() {
    this.container = null;
    this.currentHero = null;
    this.isVisible = false;
  }

  init() {
    this.createContainer();
    this.attachToDOM();
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'hero-inventory-widget';
    this.container.className = 'hero-inventory-widget';
  }

  attachToDOM() {
    document.body.appendChild(this.container);
  }

  updateHero(hero) {
    if (!hero) {
      this.hide();
      return;
    }

    this.currentHero = hero;
    this.render();
    this.show();
  }

  render() {
    if (!this.currentHero) return;

    const abilities = this.currentHero.purchasedAbilities || [];
    const artifacts = this.currentHero.artifacts || [];
    const equipment = this.currentHero.equipment || [];

    this.container.innerHTML = `
      <div class="hero-inventory-content">
        <div class="inventory-header">
          <h3>📦 Inventory</h3>
        </div>
        
        ${this.renderSection('⚡ Abilities', abilities, 'abilities')}
        ${this.renderSection('🏺 Artifacts', artifacts, 'artifacts')}
        ${this.renderSection('⚔️ Equipment', equipment, 'equipment')}
      </div>
    `;
  }

  renderSection(title, items, type) {
    if (!items || items.length === 0) {
      return `
        <div class="inventory-section ${type}">
          <div class="section-title">${title}</div>
          <div class="section-content empty">
            <span class="empty-message">None</span>
          </div>
        </div>
      `;
    }

    return `
      <div class="inventory-section ${type}">
        <div class="section-title">${title} (${items.length})</div>
        <div class="section-content">
          ${items.map(item => this.renderItem(item, type)).join('')}
        </div>
      </div>
    `;
  }

  renderItem(item, type) {
    const emoji = item.emoji || this.getDefaultEmoji(type);
    const name = item.name || 'Unknown';
    const description = item.description || '';
    
    return `
      <div class="inventory-item" title="${description}">
        <span class="item-emoji">${emoji}</span>
        <span class="item-name">${name}</span>
      </div>
    `;
  }

  getDefaultEmoji(type) {
    const defaults = {
      'abilities': '⚡',
      'artifacts': '🏺',
      'equipment': '⚔️'
    };
    return defaults[type] || '📦';
  }

  show() {
    if (this.container) {
      this.container.style.display = 'block';
      this.isVisible = true;
    }
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
      this.isVisible = false;
    }
  }

  refresh() {
    if (this.currentHero && this.isVisible) {
      this.render();
    }
  }
}
