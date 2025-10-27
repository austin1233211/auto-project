/**
 * Absorption status effect.
 * Absorbs a number of incoming attacks.
 */

import { ensureStatusEffects } from './utils.js';

/**
 * Applies absorption effect to a target.
 * @param {Object} target - The hero to apply absorption to
 * @param {number} count - Number of attacks to absorb
 */
export function apply(target, count) {
  ensureStatusEffects(target);
  
  target.statusEffects.push({
    type: 'absorption',
    count: count,
    ticksRemaining: count
  });
}

/**
 * Called when absorption effect expires.
 * @param {Object} hero - The hero losing absorption
 * @param {Object} ctx - Context with addToLog
 */
export function onExpire(hero, ctx) {
  ctx.addToLog(`${hero.name} recovers from absorption.`);
}
