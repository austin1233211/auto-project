import { createEffect } from './ability-effects/effect-registry.js';

/**
 * @typedef {Object} HeroStats
 * @property {number} health
 * @property {number} attack
 * @property {number} armor
 * @property {number} speed
 * @property {number} [manaRegeneration]
 * @property {number} [critChance]
 * @property {number} [critDamage]
 * @property {number} [evasionChance]
 * @property {number} [physicalDamageReduction]
 * @property {number} [magicDamageReduction]
 * @property {number} [abilityEffectiveness]
 * @property {number} [extraShieldStacks]
 * @property {number} [extraPoisonStacks]
 * @property {number} [extraFrostStacks]
 * @property {number} [extraRegenStacks]
 * @property {number} [enemyRegenReductionPct]
 * @property {number} [attackDamagePct]
 * @property {number} [healthRegenPct]
 * @property {number} [critDamageTakenReduction]
 * @property {number} [magicDamageAmplification]
 * @property {number} [enemyMissChanceBonusPct]
 * @property {number} [stunResistancePct]
 * @property {number} [lifestealPct]
 * @property {number} [poisonDamageMultiplierPct]
 * @property {number} [poisonPerStackBonus]
 * @property {boolean} [poisonCanCrit]
 */

/**
 * @typedef {Object} Ability
 * @property {string} name
 * @property {string} effect
 * @property {number} value
 * @property {string} [tier]
 */

/**
 * @typedef {Object} EquipmentEffects
 * @property {number} [maxHpFlat]
 * @property {number} [manaRegenPerSec]
 * @property {number} [attackFlat]
 * @property {number} [attackSpeedPct]
 * @property {number} [critDamagePct]
 * @property {number} [critChancePct]
 * @property {number} [physicalDamageReductionPct]
 * @property {number} [magicDamageReductionPct]
 * @property {number} [abilityEffectivenessPct]
 * @property {number} [extraShieldStacks]
 * @property {number} [extraPoisonStacks]
 * @property {number} [extraFrostStacks]
 * @property {number} [extraRegenStacks]
 * @property {number} [enemyHealRegenReductionPct]
 * @property {number} [attackDamagePct]
 * @property {number} [healthRegenPct]
 * @property {number} [critDamageTakenReductionPct]
 * @property {number} [evasionChancePct]
 * @property {number} [magicDamageAmplificationPct]
 * @property {number} [enemyMissChanceBonusPct]
 * @property {number} [stunResistancePct]
 * @property {number} [lifestealPct]
 * @property {number} [poisonDamageMultiplierPct]
 * @property {number} [poisonPerStackBonus]
 * @property {boolean} [poisonCanCrit]
 */

/**
 * @typedef {Object} Equipment
 * @property {string} name
 * @property {string} type
 * @property {EquipmentEffects} [effects]
 */

/**
 * @typedef {Object} StatusEffect
 * @property {string} type
 * @property {number} [ticksRemaining]
 * @property {number} [bonus]
 * @property {number} [stacks]
 * @property {number} [duration]
 * @property {number} [startTime]
 */

/**
 * @typedef {Object} Hero
 * @property {string} name
 * @property {HeroStats} stats
 * @property {Ability[]} [purchasedAbilities]
 * @property {Equipment[]} [equipment]
 * @property {StatusEffect[]} [statusEffects]
 * @property {HeroStats} [effectiveStats]
 */

export class StatsCalculator {
  /**
   * Calculate effective attack with diminishing returns above 100
   * @param {number} baseAttack - Base attack value
   * @returns {number} Effective attack value
   */
  static calculateEffectiveAttack(baseAttack) {
    return this.applyDiminishingReturns(baseAttack, 100, 0.6);
  }

  /**
   * Calculate effective armor with diminishing returns above 100
   * @param {number} baseArmor - Base armor value
   * @returns {number} Effective armor value
   */
  static calculateEffectiveArmor(baseArmor) {
    return this.applyDiminishingReturns(baseArmor, 100, 0.6);
  }

  /**
   * Calculate effective speed with diminishing returns above 2.0
   * @param {number} baseSpeed - Base speed value
   * @returns {number} Effective speed value
   */
  static calculateEffectiveSpeed(baseSpeed) {
    return this.applyDiminishingReturns(baseSpeed, 2.0, 0.6);
  }

  /**
   * Apply diminishing returns to a stat value above a threshold
   * @param {number} value - The stat value
   * @param {number} threshold - The threshold above which diminishing returns apply
   * @param {number} diminishingFactor - The factor to apply to excess value (0-1)
   * @returns {number} Value with diminishing returns applied
   */
  static applyDiminishingReturns(value, threshold, diminishingFactor) {
    if (value <= threshold) {
      return value;
    }
    
    const excessValue = value - threshold;
    const diminishedExcess = excessValue * diminishingFactor;
    return threshold + diminishedExcess;
  }

  /**
   * Process hero stats by applying abilities, equipment, and status effects
   * @param {Hero} hero - The hero object
   * @returns {Hero} Hero with effectiveStats calculated
   */
  static processHeroStats(hero) {
    let modifiedStats = { ...hero.stats };
    
    if (hero.purchasedAbilities && hero.purchasedAbilities.length > 0) {
      for (const ability of hero.purchasedAbilities) {
        const effect = createEffect(ability);
        if (effect) {
          effect.apply(modifiedStats);
        }
      }
    }
    
    if (hero.equipment && hero.equipment.length > 0) {
      for (const item of hero.equipment) {
        const fx = item.effects || {};
        if (fx.maxHpFlat) modifiedStats.health += fx.maxHpFlat;
        if (fx.manaRegenPerSec) modifiedStats.manaRegeneration = (modifiedStats.manaRegeneration || 0) + fx.manaRegenPerSec;
        if (fx.attackFlat) modifiedStats.attack += fx.attackFlat;
        if (fx.attackSpeedPct) modifiedStats.speed *= (1 + fx.attackSpeedPct / 100);
        if (fx.critDamagePct) modifiedStats.critDamage = (modifiedStats.critDamage || 1.5) + (fx.critDamagePct / 100);
        if (fx.critChancePct) modifiedStats.critChance = (modifiedStats.critChance || 0) + (fx.critChancePct / 100);
        if (fx.physicalDamageReductionPct) modifiedStats.physicalDamageReduction = (modifiedStats.physicalDamageReduction || 0) + fx.physicalDamageReductionPct;
        if (fx.magicDamageReductionPct) modifiedStats.magicDamageReduction = (modifiedStats.magicDamageReduction || 0) + (fx.magicDamageReductionPct / 100);
        if (fx.abilityEffectivenessPct) modifiedStats.abilityEffectiveness = (modifiedStats.abilityEffectiveness || 0) + fx.abilityEffectivenessPct;
        if (fx.extraShieldStacks) modifiedStats.extraShieldStacks = (modifiedStats.extraShieldStacks || 0) + fx.extraShieldStacks;
        if (fx.extraPoisonStacks) modifiedStats.extraPoisonStacks = (modifiedStats.extraPoisonStacks || 0) + fx.extraPoisonStacks;
        if (fx.extraFrostStacks) modifiedStats.extraFrostStacks = (modifiedStats.extraFrostStacks || 0) + fx.extraFrostStacks;
        if (fx.extraRegenStacks) modifiedStats.extraRegenStacks = (modifiedStats.extraRegenStacks || 0) + fx.extraRegenStacks;
        if (fx.enemyHealRegenReductionPct) modifiedStats.enemyRegenReductionPct = (modifiedStats.enemyRegenReductionPct || 0) + fx.enemyHealRegenReductionPct;
        if (fx.attackDamagePct) modifiedStats.attackDamagePct = (modifiedStats.attackDamagePct || 0) + fx.attackDamagePct;
        if (fx.healthRegenPct) modifiedStats.healthRegenPct = (modifiedStats.healthRegenPct || 0) + fx.healthRegenPct;
        if (fx.critDamageTakenReductionPct) modifiedStats.critDamageTakenReduction = (modifiedStats.critDamageTakenReduction || 0) + fx.critDamageTakenReductionPct;
        if (fx.evasionChancePct) modifiedStats.evasionChance = (modifiedStats.evasionChance || 0) + (fx.evasionChancePct / 100);
        if (fx.magicDamageAmplificationPct) modifiedStats.magicDamageAmplification = (modifiedStats.magicDamageAmplification || 0) + fx.magicDamageAmplificationPct;
        if (fx.enemyMissChanceBonusPct) modifiedStats.enemyMissChanceBonusPct = (modifiedStats.enemyMissChanceBonusPct || 0) + fx.enemyMissChanceBonusPct;
        if (fx.stunResistancePct) modifiedStats.stunResistancePct = (modifiedStats.stunResistancePct || 0) + fx.stunResistancePct;
        if (fx.lifestealPct) modifiedStats.lifestealPct = (modifiedStats.lifestealPct || 0) + fx.lifestealPct;
        if (fx.poisonDamageMultiplierPct) modifiedStats.poisonDamageMultiplierPct = (modifiedStats.poisonDamageMultiplierPct || 0) + fx.poisonDamageMultiplierPct;
        if (fx.poisonPerStackBonus) modifiedStats.poisonPerStackBonus = (modifiedStats.poisonPerStackBonus || 0) + fx.poisonPerStackBonus;
        if (fx.poisonCanCrit) modifiedStats.poisonCanCrit = true;
      }
    }
    
    let effectiveSpeed = this.calculateEffectiveSpeed(modifiedStats.speed);
    
    if (hero.statusEffects) {
      for (const effect of hero.statusEffects) {
        if (effect.type === 'attack_speed' && effect.ticksRemaining > 0) {
          effectiveSpeed *= (1 + effect.bonus);
        }
      }
    }
    
    return {
      ...hero,
      effectiveStats: {
        ...modifiedStats,
        attack: this.calculateEffectiveAttack(modifiedStats.attack),
        speed: effectiveSpeed
      }
    };
  }
}
