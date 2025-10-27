/**
 * Shield stacks status effect.
 * Stacking shield effect that persists.
 */

import { ensureStatusEffects } from './utils.js';

/**
 * Applies shield stacks to a target (stacking variant).
 * @param {Object} target - The hero to apply shield stacks to
 * @param {number} stacks - Number of stacks to add
 */
export function applyStacks(target, stacks) {
  ensureStatusEffects(target);
  
  let existingShield = target.statusEffects.find(e => e.type === 'shield_stacks');
  if (existingShield) {
    existingShield.stacks += stacks;
  } else {
    target.statusEffects.push({
      type: 'shield_stacks',
      stacks: stacks
    });
  }
}

/**
 * Processes shield stacks (no decay, just persistence check).
 * @param {Object} hero - The hero with shield stacks
 * @param {Object} effect - The shield_stacks effect object
 * @param {Object} ctx - Context (unused for shield)
 * @returns {boolean} True if effect should continue
 */
export function onStackTick(hero, effect, ctx) {
  return effect.stacks >= 1;
}
