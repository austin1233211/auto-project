/**
 * Dodge status effect.
 * Increases dodge chance temporarily.
 */

import { ensureStatusEffects } from './utils.js';

/**
 * Applies dodge effect to a target.
 * @param {Object} target - The hero to apply dodge to
 * @param {number} chance - Dodge chance (0-1)
 * @param {number} duration - Number of ticks
 */
export function apply(target, chance, duration) {
  ensureStatusEffects(target);
  
  target.statusEffects.push({
    type: 'dodge',
    chance: chance,
    duration: duration,
    ticksRemaining: duration
  });
}

/**
 * Called when dodge effect expires.
 * @param {Object} hero - The hero losing dodge bonus
 * @param {Object} ctx - Context with addToLog
 */
export function onExpire(hero, ctx) {
  ctx.addToLog(`${hero.name} recovers from dodge.`);
}
