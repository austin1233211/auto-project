/**
 * Utility functions for status effect management.
 */

/**
 * Ensures a hero has a statusEffects array.
 * @param {Object} target - The hero to ensure has statusEffects
 */
export function ensureStatusEffects(target) {
  if (!target.statusEffects) {
    target.statusEffects = [];
  }
}

/**
 * Clamps health to valid range [0, maxHealth].
 * @param {number} health - Current health value
 * @param {number} maxHealth - Maximum health value
 * @returns {number} Clamped health value
 */
export function clampHealth(health, maxHealth = Infinity) {
  return Math.max(0, Math.min(health, maxHealth));
}
