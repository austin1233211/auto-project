/**
 * Status Effects Display Component
 * Shows active status effects (frost, poison, shield, burn, bleed, etc.) for each hero during combat
 */

export class StatusEffectsDisplay {
  constructor() {
    this.playerContainer = null;
    this.enemyContainer = null;
  }

  /**
   * Initialize the status effects display containers
   */
  init() {
    this.playerContainer = document.createElement('div');
    this.playerContainer.id = 'player-status-effects';
    this.playerContainer.className = 'status-effects-container';

    this.enemyContainer = document.createElement('div');
    this.enemyContainer.id = 'enemy-status-effects';
    this.enemyContainer.className = 'status-effects-container';
  }

  /**
   * Attach the status effects displays to the DOM
   * Should be called after combat UI is rendered
   */
  attachToDOM() {
    const playerCard = document.querySelector('.player-hero-card, .hero-card:first-child');
    const enemyCard = document.querySelector('.enemy-hero-card, .hero-card:last-child');

    if (playerCard && this.playerContainer) {
      playerCard.parentNode.insertBefore(this.playerContainer, playerCard.nextSibling);
    }

    if (enemyCard && this.enemyContainer) {
      enemyCard.parentNode.insertBefore(this.enemyContainer, enemyCard.nextSibling);
    }
  }

  /**
   * Update the status effects display for both heroes
   * @param {Object} playerHero - Player hero object with statusEffects array
   * @param {Object} enemyHero - Enemy hero object with statusEffects array
   */
  update(playerHero, enemyHero) {
    if (this.playerContainer && playerHero) {
      this.renderStatusEffects(this.playerContainer, playerHero);
    }

    if (this.enemyContainer && enemyHero) {
      this.renderStatusEffects(this.enemyContainer, enemyHero);
    }
  }

  /**
   * Render status effects for a single hero
   * @param {HTMLElement} container - Container element to render into
   * @param {Object} hero - Hero object with statusEffects array
   */
  renderStatusEffects(container, hero) {
    if (!hero || !hero.statusEffects || hero.statusEffects.length === 0) {
      container.innerHTML = '<div class="no-status-effects">No active effects</div>';
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';

    const effects = this.groupStatusEffects(hero.statusEffects);
    
    container.innerHTML = `
      <div class="status-effects-list">
        ${effects.map(effect => this.renderStatusEffect(effect)).join('')}
      </div>
    `;
  }

  /**
   * Group and format status effects for display
   * @param {Array} statusEffects - Array of status effect objects
   * @returns {Array} Formatted effects for display
   */
  groupStatusEffects(statusEffects) {
    const effects = [];

    for (const effect of statusEffects) {
      const formatted = this.formatStatusEffect(effect);
      if (formatted) {
        effects.push(formatted);
      }
    }

    return effects;
  }

  /**
   * Format a single status effect for display
   * @param {Object} effect - Status effect object
   * @returns {Object|null} Formatted effect with emoji, name, and value
   */
  formatStatusEffect(effect) {
    const effectConfig = {
      'poison_stacks': { emoji: '☠️', name: 'Poison', getValue: (e) => `${e.stacks || 0} stacks` },
      'frost_stacks': { emoji: '🧊', name: 'Frost', getValue: (e) => `${e.stacks || 0} stacks` },
      'shield_stacks': { emoji: '🛡️', name: 'Shield', getValue: (e) => `${Math.floor(e.stacks || 0)} stacks` },
      'burn': { emoji: '🔥', name: 'Burn', getValue: (e) => `${e.ticksRemaining || 0} turns` },
      'poison': { emoji: '🧪', name: 'Poison DoT', getValue: (e) => `${e.ticksRemaining || 0} turns` },
      'bleed': { emoji: '🩸', name: 'Bleed', getValue: (e) => `${e.ticksRemaining || 0} turns` },
      'stun': { emoji: '💫', name: 'Stunned', getValue: (e) => `${e.ticksRemaining || 0} turns` },
      'immunity': { emoji: '✨', name: 'Immunity', getValue: (e) => `${e.ticksRemaining || 0} turns` },
      'damage_reduction': { emoji: '🛡️', name: 'Damage Reduction', getValue: (e) => `${e.ticksRemaining || 0} turns` },
      'attack_speed': { emoji: '⚡', name: 'Attack Speed', getValue: (e) => `${e.ticksRemaining || 0} turns` },
      'absorption': { emoji: '💠', name: 'Absorption', getValue: (e) => `${e.ticksRemaining || 0} turns` },
      'dodge': { emoji: '💨', name: 'Dodge', getValue: (e) => `${e.ticksRemaining || 0} turns` },
      'stealth': { emoji: '👻', name: 'Stealth', getValue: (e) => `${e.ticksRemaining || 0} turns` },
      'poison_blade': { emoji: '🗡️', name: 'Poison Blade', getValue: (e) => `${e.ticksRemaining || 0} turns` },
      'skeleton': { emoji: '💀', name: 'Skeleton', getValue: (e) => `${e.ticksRemaining || 0} turns` }
    };

    const config = effectConfig[effect.type];
    if (!config) {
      return {
        emoji: '❓',
        name: effect.type,
        value: effect.stacks ? `${effect.stacks} stacks` : `${effect.ticksRemaining || 0} turns`,
        type: effect.type
      };
    }

    return {
      emoji: config.emoji,
      name: config.name,
      value: config.getValue(effect),
      type: effect.type
    };
  }

  /**
   * Render a single status effect as HTML
   * @param {Object} effect - Formatted effect object
   * @returns {string} HTML string for the effect
   */
  renderStatusEffect(effect) {
    return `
      <div class="status-effect" data-effect-type="${effect.type}">
        <span class="status-effect-emoji">${effect.emoji}</span>
        <div class="status-effect-info">
          <span class="status-effect-name">${effect.name}</span>
          <span class="status-effect-value">${effect.value}</span>
        </div>
      </div>
    `;
  }

  /**
   * Clear and hide the status effects displays
   */
  clear() {
    if (this.playerContainer) {
      this.playerContainer.innerHTML = '';
      this.playerContainer.style.display = 'none';
    }

    if (this.enemyContainer) {
      this.enemyContainer.innerHTML = '';
      this.enemyContainer.style.display = 'none';
    }
  }

  /**
   * Remove the status effects displays from the DOM
   */
  destroy() {
    if (this.playerContainer && this.playerContainer.parentNode) {
      this.playerContainer.parentNode.removeChild(this.playerContainer);
    }

    if (this.enemyContainer && this.enemyContainer.parentNode) {
      this.enemyContainer.parentNode.removeChild(this.enemyContainer);
    }

    this.playerContainer = null;
    this.enemyContainer = null;
  }
}
