/**
 * Skeleton status effect.
 * Summons a skeleton that attacks the target.
 */

import { ensureStatusEffects, clampHealth } from './utils.js';

/**
 * Applies skeleton effect to a caster.
 * @param {Object} caster - The hero summoning the skeleton
 * @param {Object} target - The target to attack
 * @param {number} attackPercent - Percentage of caster's attack
 * @param {number} duration - Number of ticks
 */
export function apply(caster, target, attackPercent, duration) {
  ensureStatusEffects(caster);
  
  caster.statusEffects.push({
    type: 'skeleton',
    target: target,
    attackPercent: attackPercent,
    duration: duration,
    ticksRemaining: duration
  });
}

/**
 * Processes skeleton tick damage.
 * @param {Object} hero - The hero with skeleton effect
 * @param {Object} effect - The skeleton effect object
 * @param {Object} ctx - Context with addToLog and calculateDamage
 * @returns {boolean} True if effect should continue
 */
export function onTick(hero, effect, ctx) {
  if (effect.target) {
    const skeletonDamage = Math.round(hero.effectiveStats.attack * effect.attackPercent);
    const damage = ctx.calculateDamage(skeletonDamage, effect.target, 'physical');
    effect.target.currentHealth = clampHealth(effect.target.currentHealth - damage);
    ctx.addToLog(`💀 ${hero.name}'s skeleton attacks for ${damage} damage!`);
  }
  
  effect.ticksRemaining--;
  return effect.ticksRemaining > 0;
}

/**
 * Called when skeleton effect expires.
 * @param {Object} hero - The hero losing skeleton
 * @param {Object} ctx - Context with addToLog
 */
export function onExpire(hero, ctx) {
  ctx.addToLog(`${hero.name} recovers from skeleton.`);
}
