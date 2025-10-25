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
    
    const effectiveAttack = this.calculateEffectiveAttack(modifiedStats.attack);
    const effectiveArmor = this.calculateEffectiveArmor(modifiedStats.armor);
    const effectiveSpeed = this.calculateEffectiveSpeed(modifiedStats.speed);
    
    return {
      ...modifiedStats,
      attack: effectiveAttack,
      armor: effectiveArmor,
      speed: effectiveSpeed,
      health: modifiedStats.health,
      critChance: modifiedStats.critChance || 0,
      critDamage: modifiedStats.critDamage || 1.5,
      evasionChance: modifiedStats.evasionChance || 0,
      evasionDamageReduction: modifiedStats.evasionDamageReduction || 0.6,
      magicDamageReduction: modifiedStats.magicDamageReduction || 0,
      physicalDamageAmplification: modifiedStats.physicalDamageAmplification || 0,
      magicDamageAmplification: modifiedStats.magicDamageAmplification || 0,
      manaRegeneration: modifiedStats.manaRegeneration || 0,
    };
  }
}
