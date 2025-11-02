/**
 * Status effect processor.
 * Handles ticking and expiration of all status effects.
 */

import * as PoisonEffect from './poison.js';
import * as FrostEffect from './frost.js';
import * as ShieldEffect from './shield.js';
import * as BurnEffect from './burn.js';
import * as SkeletonEffect from './skeleton.js';
import * as StunEffect from './stun.js';
import * as DamageReductionEffect from './damage-reduction.js';
import * as AttackSpeedEffect from './attack-speed.js';
import * as AbsorptionEffect from './absorption.js';
import * as DodgeEffect from './dodge.js';
import * as StealthEffect from './stealth.js';
import * as PoisonBladeEffect from './poison-blade.js';
import * as ImmunityEffect from './immunity.js';

/**
 * Processes all status effects on a hero.
 * Handles damage, decay, and expiration in the correct order.
 * 
 * @param {Object} hero - The hero to process effects for
 * @param {Object} ctx - Context with combat methods
 */
export function processStatusEffects(hero, ctx) {
  if (!hero.statusEffects) return;
  
  const activeEffects = [];
  const now = Date.now();
  
  for (const effect of hero.statusEffects) {
    if (effect.type === 'poison_stacks') {
      if (PoisonEffect.onStackTick(hero, effect, ctx, now)) {
        activeEffects.push(effect);
      }
    } else if (effect.type === 'frost_stacks') {
      if (FrostEffect.onStackTick(hero, effect, ctx, now)) {
        activeEffects.push(effect);
      }
    } else if (effect.type === 'shield_stacks') {
      if (ShieldEffect.onStackTick(hero, effect, ctx)) {
        activeEffects.push(effect);
      }
    } else if (effect.ticksRemaining > 0) {
      let shouldContinue = true;
      
      if (effect.type === 'burn') {
        shouldContinue = BurnEffect.onTick(hero, effect, ctx);
      } else if (effect.type === 'poison') {
        shouldContinue = PoisonEffect.onTick(hero, effect, ctx);
      } else if (effect.type === 'skeleton') {
        shouldContinue = SkeletonEffect.onTick(hero, effect, ctx);
      } else {
        effect.ticksRemaining--;
        shouldContinue = effect.ticksRemaining > 0;
      }
      
      if (shouldContinue) {
        activeEffects.push(effect);
      } else {
        const effectHandlers = {
          'burn': BurnEffect,
          'poison': PoisonEffect,
          'stun': StunEffect,
          'damage_reduction': DamageReductionEffect,
          'attack_speed': AttackSpeedEffect,
          'absorption': AbsorptionEffect,
          'dodge': DodgeEffect,
          'stealth': StealthEffect,
          'poison_blade': PoisonBladeEffect,
          'immunity': ImmunityEffect,
          'skeleton': SkeletonEffect
        };
        
        const handler = effectHandlers[effect.type];
        if (handler && handler.onExpire) {
          handler.onExpire(hero, ctx);
        } else {
          ctx.addToLog(`${hero.name} recovers from ${effect.type}.`);
        }
      }
    }
  }
  
  hero.statusEffects = activeEffects;
}
