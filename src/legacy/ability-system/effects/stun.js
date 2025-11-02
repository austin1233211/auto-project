/**
 * Stun status effect.
 * Prevents the affected hero from taking actions.
 */

import { ensureStatusEffects } from './utils.js';

/**
 * Applies stun effect to a target.
 * @param {Object} target - The hero to stun
 * @param {number} duration - Number of ticks
 */
export function apply(target, duration) {
  ensureStatusEffects(target);
  
  target.statusEffects.push({
    type: 'stun',
    duration: duration,
    ticksRemaining: duration
  });
}

/**
 * Called when stun effect expires.
 * @param {Object} hero - The hero recovering from stun
 * @param {Object} ctx - Context with addToLog
 */
export function onExpire(hero, ctx) {
  ctx.addToLog(`${hero.name} recovers from stun.`);
}
