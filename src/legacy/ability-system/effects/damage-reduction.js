/**
 * Damage reduction status effect.
 * Reduces incoming damage by a percentage.
 */

import { ensureStatusEffects } from './utils.js';

/**
 * Applies damage reduction effect to a target.
 * @param {Object} target - The hero to apply damage reduction to
 * @param {number} reduction - Damage reduction amount (0-1)
 * @param {number} duration - Number of ticks
 */
export function apply(target, reduction, duration) {
  ensureStatusEffects(target);
  
  target.statusEffects.push({
    type: 'damage_reduction',
    reduction: reduction,
    duration: duration,
    ticksRemaining: duration
  });
}

/**
 * Called when damage reduction effect expires.
 * @param {Object} hero - The hero losing damage reduction
 * @param {Object} ctx - Context with addToLog
 */
export function onExpire(hero, ctx) {
  ctx.addToLog(`${hero.name} recovers from damage_reduction.`);
}
