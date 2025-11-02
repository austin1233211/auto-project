import { logger } from '../utils/logger.js';

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
    const playerCard = document.querySelector('.hero-battle-card.player');
    const enemyCard = document.querySelector('.hero-battle-card.enemy');

    if (playerCard && this.playerContainer) {
      playerCard.insertAdjacentElement('beforeend', this.playerContainer);
    } else if (!playerCard) {
      logger.warn('StatusEffectsDisplay: player card not found');
    }

    if (enemyCard && this.enemyContainer) {
      enemyCard.insertAdjacentElement('beforeend', this.enemyContainer);
    } else if (!enemyCard) {
      logger.warn('StatusEffectsDisplay: enemy card not found');
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
    if (!hero) {
      return;
    }

    container.style.display = 'block';

    const commonEffects = [
      { type: 'frost_stacks', emoji: '🧊', name: 'Frost' },
      { type: 'poison_stacks', emoji: '☠️', name: 'Poison' },
      { type: 'shield_stacks', emoji: '🛡️', name: 'Shield' },
      { type: 'burn', emoji: '🔥', name: 'Burn' },
      { type: 'bleed', emoji: '🩸', name: 'Bleed' },
      { type: 'stun', emoji: '💫', name: 'Stun' }
    ];

    const activeEffectsMap = new Map();
    if (hero.statusEffects && hero.statusEffects.length > 0) {
      for (const effect of hero.statusEffects) {
        activeEffectsMap.set(effect.type, effect);
      }
    }

    const effectsHTML = commonEffects.map(effectDef => {
      const activeEffect = activeEffectsMap.get(effectDef.type);
      const isActive = !!activeEffect;
      
      let value = '0';
      if (isActive) {
        if (activeEffect.stacks !== undefined) {
          value = Math.floor(activeEffect.stacks || 0).toString();
        } else if (activeEffect.ticksRemaining !== undefined) {
          value = (activeEffect.ticksRemaining || 0).toString();
        }
      }

      return this.renderStatusEffect({
        emoji: effectDef.emoji,
        name: effectDef.name,
        value: value,
        type: effectDef.type,
        isActive: isActive
      });
    }).join('');
    
    container.innerHTML = `
      <div class="status-effects-list">
        ${effectsHTML}
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
    const activeClass = effect.isActive ? 'active' : 'inactive';
    const tooltip = `${effect.name}: ${effect.value}`;
    return `
      <div class="status-effect ${activeClass}" data-effect-type="${effect.type}" title="${tooltip}">
        <span class="status-effect-emoji">${effect.emoji}</span>
        <span class="status-effect-value">${effect.value}</span>
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
