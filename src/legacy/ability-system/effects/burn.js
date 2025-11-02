/**
 * Burn status effect.
 * Deals damage over time to the affected hero.
 */

import { ensureStatusEffects, clampHealth } from './utils.js';

/**
 * Applies burn effect to a target.
 * @param {Object} target - The hero to apply burn to
 * @param {number} burnDamage - Damage per tick
 * @param {number} duration - Number of ticks
 */
export function apply(target, burnDamage, duration) {
  ensureStatusEffects(target);
  
  target.statusEffects.push({
    type: 'burn',
    damage: burnDamage,
    duration: duration,
    ticksRemaining: duration
  });
}

/**
 * Processes burn tick damage.
 * @param {Object} hero - The hero with burn effect
 * @param {Object} effect - The burn effect object
 * @param {Object} ctx - Context with addToLog and damageMultiplier
 * @returns {boolean} True if effect should continue
 */
export function onTick(hero, effect, ctx) {
  const escalatedDamage = Math.round(effect.damage * ctx.damageMultiplier);
  hero.currentHealth = clampHealth(hero.currentHealth - escalatedDamage);
  ctx.addToLog(`🔥 ${hero.name} takes ${escalatedDamage} burn damage!`);
  
  effect.ticksRemaining--;
  return effect.ticksRemaining > 0;
}

/**
 * Called when burn effect expires.
 * @param {Object} hero - The hero recovering from burn
 * @param {Object} ctx - Context with addToLog
 */
export function onExpire(hero, ctx) {
  ctx.addToLog(`${hero.name} recovers from burn.`);
}
