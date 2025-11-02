/**
 * Poison status effect.
 * Deals damage over time to the affected hero.
 */

import { ensureStatusEffects, clampHealth } from './utils.js';

/**
 * Applies poison effect to a target.
 * @param {Object} target - The hero to apply poison to
 * @param {number} poisonDamage - Damage per tick
 * @param {number} duration - Number of ticks
 */
export function apply(target, poisonDamage, duration) {
  ensureStatusEffects(target);
  
  target.statusEffects.push({
    type: 'poison',
    damage: poisonDamage,
    duration: duration,
    ticksRemaining: duration
  });
}

/**
 * Processes poison tick damage.
 * @param {Object} hero - The hero with poison effect
 * @param {Object} effect - The poison effect object
 * @param {Object} ctx - Context with addToLog and damageMultiplier
 * @returns {boolean} True if effect should continue
 */
export function onTick(hero, effect, ctx) {
  const escalatedDamage = Math.round(effect.damage * ctx.damageMultiplier);
  hero.currentHealth = clampHealth(hero.currentHealth - escalatedDamage);
  ctx.addToLog(`☠️ ${hero.name} takes ${escalatedDamage} poison damage!`);
  
  effect.ticksRemaining--;
  return effect.ticksRemaining > 0;
}

/**
 * Called when poison effect expires.
 * @param {Object} hero - The hero recovering from poison
 * @param {Object} ctx - Context with addToLog
 */
export function onExpire(hero, ctx) {
  ctx.addToLog(`${hero.name} recovers from poison.`);
}

/**
 * Applies poison stacks to a target (stacking variant).
 * @param {Object} target - The hero to apply poison stacks to
 * @param {number} stacks - Number of stacks to add
 */
export function applyStacks(target, stacks) {
  ensureStatusEffects(target);
  
  let existingPoison = target.statusEffects.find(e => e.type === 'poison_stacks');
  if (existingPoison) {
    existingPoison.stacks += stacks;
  } else {
    target.statusEffects.push({
      type: 'poison_stacks',
      stacks: stacks,
      lastTick: Date.now()
    });
  }
}

/**
 * Processes poison stacks tick (time-based with decay).
 * @param {Object} hero - The hero with poison stacks
 * @param {Object} effect - The poison_stacks effect object
 * @param {Object} ctx - Context with addToLog
 * @param {number} now - Current timestamp
 * @returns {boolean} True if effect should continue
 */
export function onStackTick(hero, effect, ctx, now) {
  if (!effect.lastTick) effect.lastTick = now;
  
  if (now - effect.lastTick >= 1000) {
    const damage = Math.max(1, Math.floor(effect.stacks));
    hero.currentHealth = clampHealth(hero.currentHealth - damage);
    ctx.addToLog(`☠️ ${hero.name} takes ${damage} poison damage from ${effect.stacks} stacks!`);
    
    effect.stacks = Math.floor(effect.stacks * 0.7);
    effect.lastTick = now;
  }
  
  return effect.stacks >= 1;
}
