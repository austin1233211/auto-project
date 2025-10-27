/**
 * Battle Renderer Interface
 * 
 * Abstract interface for rendering battle scenes.
 * Implementations can use different rendering technologies (Three.js, Babylon.js, etc.)
 */
export class BattleRenderer {
  /**
   * Initialize the renderer with a container element
   * @param {HTMLElement} container - DOM element to render into
   * @param {Object} options - Renderer options
   */
  constructor(container, options = {}) {
    if (new.target === BattleRenderer) {
      throw new TypeError("Cannot construct BattleRenderer instances directly");
    }
    this.container = container;
    this.options = options;
  }

  /**
   * Initialize the rendering scene
   * @returns {Promise<void>}
   */
  async init() {
    throw new Error("Method 'init()' must be implemented");
  }

  /**
   * Spawn a hero in the scene
   * @param {Object} hero - Hero data
   * @param {string} side - 'player' or 'enemy'
   * @returns {Promise<Object>} Hero mesh/object reference
   */
  async spawnHero(hero, side) {
    throw new Error("Method 'spawnHero()' must be implemented");
  }

  /**
   * Play an animation for a hero
   * @param {string} side - 'player' or 'enemy'
   * @param {string} animationName - Name of animation (idle, attack, hit, death)
   * @param {Object} options - Animation options
   */
  playAnimation(side, animationName, options = {}) {
    throw new Error("Method 'playAnimation()' must be implemented");
  }

  /**
   * Update health display for a hero
   * @param {string} side - 'player' or 'enemy'
   * @param {number} currentHealth - Current health value
   * @param {number} maxHealth - Maximum health value
   */
  updateHealth(side, currentHealth, maxHealth) {
    throw new Error("Method 'updateHealth()' must be implemented");
  }

  /**
   * Update mana display for a hero
   * @param {string} side - 'player' or 'enemy'
   * @param {number} currentMana - Current mana value
   * @param {number} maxMana - Maximum mana value
   */
  updateMana(side, currentMana, maxMana) {
    throw new Error("Method 'updateMana()' must be implemented");
  }

  /**
   * Show damage number at hero position
   * @param {string} side - 'player' or 'enemy'
   * @param {number} damage - Damage amount
   * @param {boolean} isCrit - Whether it's a critical hit
   */
  showDamage(side, damage, isCrit = false) {
    throw new Error("Method 'showDamage()' must be implemented");
  }

  /**
   * Trigger a visual effect
   * @param {string} effectName - Name of the effect
   * @param {string} side - 'player' or 'enemy'
   * @param {Object} options - Effect options
   */
  playEffect(effectName, side, options = {}) {
    throw new Error("Method 'playEffect()' must be implemented");
  }

  /**
   * Update the render loop (called each frame)
   * @param {number} deltaTime - Time since last frame in milliseconds
   */
  update(deltaTime) {
    throw new Error("Method 'update()' must be implemented");
  }

  /**
   * Resize the renderer
   */
  resize() {
    throw new Error("Method 'resize()' must be implemented");
  }

  /**
   * Clean up resources
   */
  dispose() {
    throw new Error("Method 'dispose()' must be implemented");
  }
}
