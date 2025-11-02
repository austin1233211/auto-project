/**
 * Attack speed status effect.
 * Increases attack speed by a bonus amount.
 */

import { ensureStatusEffects } from './utils.js';

/**
 * Applies attack speed effect to a target.
 * @param {Object} target - The hero to apply attack speed to
 * @param {number} bonus - Attack speed bonus amount
 * @param {number} duration - Number of ticks
 */
export function apply(target, bonus, duration) {
  ensureStatusEffects(target);
  
  target.statusEffects.push({
    type: 'attack_speed',
    bonus: bonus,
    duration: duration,
    ticksRemaining: duration
  });
}

/**
 * Called when attack speed effect expires.
 * @param {Object} hero - The hero losing attack speed bonus
 * @param {Object} ctx - Context with addToLog
 */
export function onExpire(hero, ctx) {
  ctx.addToLog(`${hero.name} recovers from attack_speed.`);
}
