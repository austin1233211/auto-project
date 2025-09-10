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
    let effectiveSpeed = this.calculateEffectiveSpeed(hero.stats.speed);
    
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
        health: hero.stats.health,
        attack: this.calculateEffectiveAttack(hero.stats.attack),
        armor: hero.stats.armor,
        magicDamageReduction: hero.stats.magicDamageReduction || 0,
        physicalDamageAmplification: hero.stats.physicalDamageAmplification || 0,
        magicDamageAmplification: hero.stats.magicDamageAmplification || 0,
        speed: effectiveSpeed,
        critChance: hero.stats.critChance,
        critDamage: hero.stats.critDamage,
        evasionChance: hero.stats.evasionChance,
        evasionDamageReduction: hero.stats.evasionDamageReduction,
        manaRegeneration: hero.stats.manaRegeneration || 0
      }
    };
  }
}
