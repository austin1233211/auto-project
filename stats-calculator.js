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
        switch (ability.effect) {
          case 'attack_boost':
            modifiedStats.attack += ability.value;
            break;
          case 'speed_boost':
            modifiedStats.speed += ability.value;
            break;
          case 'health_boost':
            modifiedStats.health += ability.value;
            break;
          case 'armor_boost':
            modifiedStats.armor += ability.value;
            break;
          case 'crit_chance':
            modifiedStats.critChance = (modifiedStats.critChance || 0) + (ability.value / 100);
            break;
          case 'evasion_chance':
            modifiedStats.evasionChance = (modifiedStats.evasionChance || 0) + (ability.value / 100);
            break;
          case 'physical_amp':
            modifiedStats.physicalDamageAmplification = (modifiedStats.physicalDamageAmplification || 0) + (ability.value / 100);
            break;
          case 'magic_amp':
            modifiedStats.magicDamageAmplification = (modifiedStats.magicDamageAmplification || 0) + (ability.value / 100);
            break;
          case 'magic_resist':
            modifiedStats.magicDamageReduction = (modifiedStats.magicDamageReduction || 0) + (ability.value / 100);
            break;
          case 'stat_boost':
            modifiedStats.attack += ability.value;
            modifiedStats.health += ability.value * 10;
            modifiedStats.speed += ability.value;
            modifiedStats.armor += ability.value;
            break;
        }
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
        health: modifiedStats.health,
        attack: this.calculateEffectiveAttack(modifiedStats.attack),
        armor: modifiedStats.armor,
        magicDamageReduction: modifiedStats.magicDamageReduction || 0,
        physicalDamageAmplification: modifiedStats.physicalDamageAmplification || 0,
        magicDamageAmplification: modifiedStats.magicDamageAmplification || 0,
        speed: effectiveSpeed,
        critChance: modifiedStats.critChance,
        critDamage: modifiedStats.critDamage,
        evasionChance: modifiedStats.evasionChance,
        evasionDamageReduction: modifiedStats.evasionDamageReduction,
        manaRegeneration: modifiedStats.manaRegeneration || 0
      }
    };
  }
}
