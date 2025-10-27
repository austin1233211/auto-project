/**
 * Poison blade status effect.
 * Coats blade with poison for multiple attacks.
 */

import { ensureStatusEffects } from './utils.js';

/**
 * Applies poison blade effect to a target.
 * @param {Object} target - The hero to apply poison blade to
 * @param {number} poisonPercent - Poison damage percentage
 * @param {number} poisonDuration - Duration of poison applied
 * @param {number} buffDuration - Duration of the buff itself
 */
export function apply(target, poisonPercent, poisonDuration, buffDuration) {
  ensureStatusEffects(target);
  
  target.statusEffects.push({
    type: 'poison_blade',
    poisonPercent: poisonPercent,
    poisonDuration: poisonDuration,
    duration: buffDuration,
    ticksRemaining: buffDuration
  });
}

/**
 * Called when poison blade effect expires.
 * @param {Object} hero - The hero losing poison blade
 * @param {Object} ctx - Context with addToLog
 */
export function onExpire(hero, ctx) {
  ctx.addToLog(`${hero.name} recovers from poison_blade.`);
}
