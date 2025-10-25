import { createEffect } from './ability-effects/effect-registry.js';

export class StatsCalculator {
  static calculateEffectiveAttack(baseAttack) {
    return this.applyDiminishingReturns(baseAttack, 100, 0.6);
  }

  static calculateEffectiveArmor(baseArmor) {
    return this.applyDiminishingReturns(baseArmor, 100, 0.6);
  }

  static calculateEffectiveSpeed(baseSpeed) {
    return this.applyDiminishingReturns(baseSpeed, 2.0, 0.6);
  }

  static applyDiminishingReturns(value, threshold, diminishingFactor) {
    if (value <= threshold) {
      return value;
    }
    
    const excessValue = value - threshold;
    const diminishedExcess = excessValue * diminishingFactor;
    return threshold + diminishedExcess;
  }

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
