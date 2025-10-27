/**
 * Stealth status effect.
 * Makes hero untargetable and boosts next attack.
 */

import { ensureStatusEffects } from './utils.js';

/**
 * Applies stealth effect to a target.
 * @param {Object} target - The hero to apply stealth to
 * @param {number} nextAttackMultiplier - Damage multiplier for next attack
 * @param {number} duration - Number of ticks
 */
export function apply(target, nextAttackMultiplier, duration) {
  ensureStatusEffects(target);
  
  target.statusEffects.push({
    type: 'stealth',
    nextAttackMultiplier: nextAttackMultiplier,
    duration: duration,
    ticksRemaining: duration
  });
}

/**
 * Called when stealth effect expires.
 * @param {Object} hero - The hero losing stealth
 * @param {Object} ctx - Context with addToLog
 */
export function onExpire(hero, ctx) {
  ctx.addToLog(`${hero.name} recovers from stealth.`);
}
