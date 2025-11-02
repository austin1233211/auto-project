/**
 * Frost stacks status effect.
 * Stacking frost effect that decays over time.
 */

import { ensureStatusEffects } from './utils.js';

/**
 * Applies frost stacks to a target (stacking variant).
 * @param {Object} target - The hero to apply frost stacks to
 * @param {number} stacks - Number of stacks to add
 */
export function applyStacks(target, stacks) {
  ensureStatusEffects(target);
  
  let existingFrost = target.statusEffects.find(e => e.type === 'frost_stacks');
  if (existingFrost) {
    existingFrost.stacks += stacks;
  } else {
    target.statusEffects.push({
      type: 'frost_stacks',
      stacks: stacks,
      lastTick: Date.now()
    });
  }
}

/**
 * Processes frost stacks tick (time-based with decay).
 * @param {Object} hero - The hero with frost stacks
 * @param {Object} effect - The frost_stacks effect object
 * @param {Object} ctx - Context (unused for frost)
 * @param {number} now - Current timestamp
 * @returns {boolean} True if effect should continue
 */
export function onStackTick(hero, effect, ctx, now) {
  if (!effect.lastTick) effect.lastTick = now;
  
  if (now - effect.lastTick >= 1000) {
    effect.stacks = Math.floor(effect.stacks * 0.7);
    effect.lastTick = now;
  }
  
  return effect.stacks >= 1;
}
