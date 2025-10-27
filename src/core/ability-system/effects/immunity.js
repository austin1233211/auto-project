/**
 * Immunity status effect.
 * Makes hero immune to damage temporarily.
 */

import { ensureStatusEffects } from './utils.js';

/**
 * Applies immunity effect to a target.
 * @param {Object} target - The hero to apply immunity to
 * @param {number} duration - Number of ticks
 */
export function apply(target, duration) {
  ensureStatusEffects(target);
  
  target.statusEffects.push({
    type: 'immunity',
    duration: duration,
    ticksRemaining: duration
  });
}

/**
 * Called when immunity effect expires.
 * @param {Object} hero - The hero losing immunity
 * @param {Object} ctx - Context with addToLog
 */
export function onExpire(hero, ctx) {
  ctx.addToLog(`${hero.name} recovers from immunity.`);
}
