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
          case 'attack_speed':
            modifiedStats.attackSpeed = (modifiedStats.attackSpeed || 0) + (ability.value / 100);
            break;
          case 'mana_regen':
            modifiedStats.manaRegeneration = (modifiedStats.manaRegeneration || 0) + (ability.value / 100);
            break;
          case 'gold_bonus':
            modifiedStats.goldBonus = (modifiedStats.goldBonus || 0) + (ability.value / 100);
            break;
          case 'counter_chance':
            modifiedStats.counterChance = (modifiedStats.counterChance || 0) + (ability.value / 100);
            break;
          case 'low_health_damage':
            modifiedStats.lowHealthDamageBonus = (modifiedStats.lowHealthDamageBonus || 0) + (ability.value / 100);
            break;
          case 'damage_immunity':
            modifiedStats.damageImmunityChance = (modifiedStats.damageImmunityChance || 0) + (ability.value / 100);
            break;
          case 'ability_cooldown':
            modifiedStats.abilityCooldownReduction = (modifiedStats.abilityCooldownReduction || 0) + (ability.value / 100);
            break;
          case 'ultimate_power':
            const ultimateBonus = ability.value / 100;
            modifiedStats.attack *= (1 + ultimateBonus);
            modifiedStats.health *= (1 + ultimateBonus);
            modifiedStats.speed *= (1 + ultimateBonus);
            modifiedStats.armor *= (1 + ultimateBonus);
            break;
          case 'crit_multiplier':
            modifiedStats.critDamage = (modifiedStats.critDamage || 1.5) + (ability.value / 100);
            break;
          case 'death_save':
            modifiedStats.deathSaveCharges = (modifiedStats.deathSaveCharges || 0) + ability.value;
            break;
          
          case 'base_damage_boost':
            modifiedStats.attack += ability.value;
            break;
          case 'block_chance':
            modifiedStats.blockChance = (modifiedStats.blockChance || 0) + (ability.value / 100);
            break;
          case 'evasion_attack_damage':
            modifiedStats.evasionAttackDamage = (modifiedStats.evasionAttackDamage || 0) + (ability.value / 100);
            break;
          case 'crit_attack_boost':
            modifiedStats.critAttackBoost = (modifiedStats.critAttackBoost || 0) + ability.value;
            break;
          case 'attack_heal_chance':
            modifiedStats.attackHealChance = (modifiedStats.attackHealChance || 0) + (ability.value / 100);
            break;
          case 'attack_poison_chance':
            modifiedStats.attackPoisonChance = (modifiedStats.attackPoisonChance || 0) + (ability.value / 100);
            break;
          case 'attack_mana_restore':
            modifiedStats.attackManaRestore = (modifiedStats.attackManaRestore || 0) + (ability.value / 100);
            break;
          case 'attack_frost_chance':
            modifiedStats.attackFrostChance = (modifiedStats.attackFrostChance || 0) + (ability.value / 100);
            break;
          case 'attack_shield_chance':
            modifiedStats.attackShieldChance = (modifiedStats.attackShieldChance || 0) + (ability.value / 100);
            break;
          case 'attack_damage_increase':
            modifiedStats.attackDamageIncrease = (modifiedStats.attackDamageIncrease || 0) + (ability.value / 100);
            break;
          case 'attack_speed_increase':
            modifiedStats.attackSpeedIncrease = (modifiedStats.attackSpeedIncrease || 0) + ability.value;
            break;
          case 'counter_attack':
            modifiedStats.counterAttack = (modifiedStats.counterAttack || 0) + (ability.value / 100);
            break;
          case 'relentless_strike':
            modifiedStats.relentlessStrike = (modifiedStats.relentlessStrike || 0) + (ability.value / 100);
            break;
          case 'vendetta':
            modifiedStats.vendetta = true;
            break;
          case 'battle_trance':
            modifiedStats.battleTrance = (modifiedStats.battleTrance || 0) + (ability.value / 100);
            break;
          case 'bleeding_chance':
            modifiedStats.bleedingChance = (modifiedStats.bleedingChance || 0) + (ability.value / 100);
            break;
          case 'weapon_mastery':
            modifiedStats.weaponMastery = (modifiedStats.weaponMastery || 0) + (ability.value / 100);
            break;
          case 'berserker_focus':
            modifiedStats.berserkerFocus = (modifiedStats.berserkerFocus || 0) + ability.value;
            break;
          case 'crushing_blow':
            modifiedStats.crushingBlow = (modifiedStats.crushingBlow || 0) + (ability.value / 100);
            break;
          case 'battle_fury':
            modifiedStats.battleFury = (modifiedStats.battleFury || 0) + (ability.value / 100);
            break;
          
          case 'base_evasion_boost':
            modifiedStats.evasionChance = (modifiedStats.evasionChance || 0) + (ability.value / 100);
            break;
          case 'ignore_evade':
            modifiedStats.ignoreEvade = (modifiedStats.ignoreEvade || 0) + (ability.value / 100);
            break;
          case 'evade_poison':
            modifiedStats.evadePoisonStacks = (modifiedStats.evadePoisonStacks || 0) + ability.value;
            break;
          case 'evade_frost':
            modifiedStats.evadeFrostStacks = (modifiedStats.evadeFrostStacks || 0) + ability.value;
            break;
          case 'evade_mana':
            modifiedStats.evadeManaRestore = (modifiedStats.evadeManaRestore || 0) + ability.value;
            break;
          case 'evade_heal':
            modifiedStats.evadeHealAmount = (modifiedStats.evadeHealAmount || 0) + ability.value;
            break;
          case 'evade_shield':
            modifiedStats.evadeShieldStacks = (modifiedStats.evadeShieldStacks || 0) + ability.value;
            break;
          case 'evade_crit_damage':
            modifiedStats.evadeCritDamage = (modifiedStats.evadeCritDamage || 0) + (ability.value / 100);
            break;
          case 'magic_evasion':
            modifiedStats.magicEvasion = (modifiedStats.magicEvasion || 0) + (ability.value / 100);
            break;
          case 'evade_counter':
            modifiedStats.evadeCounter = (modifiedStats.evadeCounter || 0) + (ability.value / 100);
            break;
          case 'windrun':
            modifiedStats.windrun = (modifiedStats.windrun || 0) + ability.value;
            break;
          case 'mischief':
            modifiedStats.mischief = (modifiedStats.mischief || 0) + (ability.value / 100);
            break;
          case 'dispersion':
            modifiedStats.dispersion = (modifiedStats.dispersion || 0) + (ability.value / 100);
            break;
          case 'holy_reflection':
            modifiedStats.holyReflection = (modifiedStats.holyReflection || 0) + (ability.value / 100);
            break;
          
          case 'base_crit_boost':
            modifiedStats.critChance = (modifiedStats.critChance || 0) + (ability.value / 100);
            break;
          case 'crit_resistance':
            modifiedStats.critResistance = (modifiedStats.critResistance || 0) + (ability.value / 100);
            break;
          case 'crit_heal':
            modifiedStats.critHealAmount = (modifiedStats.critHealAmount || 0) + ability.value;
            break;
          case 'crit_poison':
            modifiedStats.critPoisonStacks = (modifiedStats.critPoisonStacks || 0) + ability.value;
            break;
          case 'crit_frost':
            modifiedStats.critFrostStacks = (modifiedStats.critFrostStacks || 0) + ability.value;
            break;
          case 'crit_mana':
            modifiedStats.critManaRestore = (modifiedStats.critManaRestore || 0) + ability.value;
            break;
          case 'crit_shield':
            modifiedStats.critShieldStacks = (modifiedStats.critShieldStacks || 0) + ability.value;
            break;
          case 'crit_hp_boost':
            modifiedStats.critHpBoost = (modifiedStats.critHpBoost || 0) + ability.value;
            break;
          case 'magic_crit':
            modifiedStats.magicCrit = (modifiedStats.magicCrit || 0) + (ability.value / 100);
            break;
          case 'greater_bash':
            modifiedStats.greaterBash = (modifiedStats.greaterBash || 0) + ability.value;
            break;
          case 'press_attack':
            modifiedStats.pressAttack = (modifiedStats.pressAttack || 0) + (ability.value / 100);
            break;
          case 'source_detonation':
            modifiedStats.sourceDetonation = (modifiedStats.sourceDetonation || 0) + (ability.value / 100);
            break;
          case 'coup_de_grace':
            modifiedStats.coupDeGrace = (modifiedStats.coupDeGrace || 0) + (ability.value / 100);
            break;
          case 'blade_dance':
            modifiedStats.bladeDance = (modifiedStats.bladeDance || 0) + (ability.value / 100);
            break;
          
          case 'health_boost_flat':
            modifiedStats.health += ability.value;
            break;
          case 'health_sect_reduction':
            modifiedStats.healthSectReduction = (modifiedStats.healthSectReduction || 0) + (ability.value / 100);
            break;
          case 'health_regen_percent':
            modifiedStats.healthRegenPercent = (modifiedStats.healthRegenPercent || 0) + (ability.value / 100);
            break;
          case 'hp_loss_poison':
            modifiedStats.hpLossPoisonRate = (modifiedStats.hpLossPoisonRate || 0) + (ability.value / 100);
            break;
          case 'hp_loss_frost':
            modifiedStats.hpLossFrostRate = (modifiedStats.hpLossFrostRate || 0) + (ability.value / 100);
            break;
          case 'hp_loss_shield':
            modifiedStats.hpLossShieldRate = (modifiedStats.hpLossShieldRate || 0) + (ability.value / 100);
            break;
          case 'blood_strike':
            modifiedStats.bloodStrike = (modifiedStats.bloodStrike || 0) + (ability.value / 100);
            break;
          case 'unyielding_spirit':
            modifiedStats.unyieldingSpirit = (modifiedStats.unyieldingSpirit || 0) + (ability.value / 100);
            break;
          case 'health_percentage_boost':
            modifiedStats.health *= (1 + ability.value / 100);
            break;
          case 'life_break':
            modifiedStats.lifeBreak = (modifiedStats.lifeBreak || 0) + (ability.value / 100);
            break;
          case 'drums_of_slom':
            modifiedStats.drumsOfSlom = (modifiedStats.drumsOfSlom || 0) + (ability.value / 100);
            break;
          
          case 'health_regen_flat':
            modifiedStats.healthRegenFlat = (modifiedStats.healthRegenFlat || 0) + ability.value;
            break;
          case 'opponent_heal_resist':
            modifiedStats.opponentHealResist = (modifiedStats.opponentHealResist || 0) + (ability.value / 100);
            break;
          case 'ultimate_heal':
            modifiedStats.ultimateHeal = (modifiedStats.ultimateHeal || 0) + ability.value;
            break;
          case 'heal_poison_chance':
            modifiedStats.healPoisonChance = (modifiedStats.healPoisonChance || 0) + (ability.value / 100);
            break;
          case 'heal_frost_chance':
            modifiedStats.healFrostChance = (modifiedStats.healFrostChance || 0) + (ability.value / 100);
            break;
          case 'heal_shield_chance':
            modifiedStats.healShieldChance = (modifiedStats.healShieldChance || 0) + (ability.value / 100);
            break;
          case 'heal_damage_chance':
            modifiedStats.healDamageChance = (modifiedStats.healDamageChance || 0) + (ability.value / 100);
            break;
          case 'heal_threshold_damage':
            modifiedStats.healThresholdDamage = (modifiedStats.healThresholdDamage || 0) + ability.value;
            break;
          case 'enhanced_regen':
            modifiedStats.enhancedRegen = (modifiedStats.enhancedRegen || 0) + ability.value;
            break;
          case 'low_hp_heal_double':
            modifiedStats.lowHpHealDouble = (modifiedStats.lowHpHealDouble || 0) + (ability.value / 100);
            break;
          case 'heal_to_damage_aura':
            modifiedStats.healToDamageAura = (modifiedStats.healToDamageAura || 0) + (ability.value / 100);
            break;
          case 'heal_to_attack_boost':
            modifiedStats.healToAttackBoost = (modifiedStats.healToAttackBoost || 0) + (ability.value / 100);
            break;
          
          case 'poison_aura':
            modifiedStats.poisonAura = (modifiedStats.poisonAura || 0) + ability.value;
            break;
          case 'poison_resistance':
            modifiedStats.poisonResistance = (modifiedStats.poisonResistance || 0) + (ability.value / 100);
            break;
          case 'ultimate_poison':
            modifiedStats.ultimatePoison = (modifiedStats.ultimatePoison || 0) + ability.value;
            break;
          case 'shield_poison_chance':
            modifiedStats.shieldPoisonChance = (modifiedStats.shieldPoisonChance || 0) + (ability.value / 100);
            break;
          case 'frost_poison_chance':
            modifiedStats.frostPoisonChance = (modifiedStats.frostPoisonChance || 0) + (ability.value / 100);
            break;
          case 'damage_poison_chance':
            modifiedStats.damagePoisonChance = (modifiedStats.damagePoisonChance || 0) + (ability.value / 100);
            break;
          case 'battle_start_poison':
            modifiedStats.battleStartPoison = (modifiedStats.battleStartPoison || 0) + ability.value;
            break;
          case 'deal_damage_poison_chance':
            modifiedStats.dealDamagePoisonChance = (modifiedStats.dealDamagePoisonChance || 0) + (ability.value / 100);
            break;
          case 'low_hp_poison_burst':
            modifiedStats.lowHpPoisonBurst = (modifiedStats.lowHpPoisonBurst || 0) + ability.value;
            break;
          case 'poison_decay_resist':
            modifiedStats.poisonDecayResist = (modifiedStats.poisonDecayResist || 0) + (ability.value / 100);
            break;
          case 'self_poison_reflect':
            modifiedStats.selfPoisonReflect = (modifiedStats.selfPoisonReflect || 0) + ability.value;
            break;
          
          case 'frost_aura':
            modifiedStats.frostAura = (modifiedStats.frostAura || 0) + ability.value;
            break;
          case 'frost_resistance':
            modifiedStats.frostResistance = (modifiedStats.frostResistance || 0) + (ability.value / 100);
            break;
          case 'ultimate_frost':
            modifiedStats.ultimateFrost = (modifiedStats.ultimateFrost || 0) + ability.value;
            break;
          case 'shield_frost_chance':
            modifiedStats.shieldFrostChance = (modifiedStats.shieldFrostChance || 0) + (ability.value / 100);
            break;
          case 'frost_damage_chance':
            modifiedStats.frostDamageChance = (modifiedStats.frostDamageChance || 0) + (ability.value / 100);
            break;
          case 'damage_frost_chance':
            modifiedStats.damageFrostChance = (modifiedStats.damageFrostChance || 0) + (ability.value / 100);
            break;
          case 'battle_start_frost':
            modifiedStats.battleStartFrost = (modifiedStats.battleStartFrost || 0) + ability.value;
            break;
          case 'frost_nova_damage':
            modifiedStats.frostNovaDamage = (modifiedStats.frostNovaDamage || 0) + ability.value;
            break;
          case 'frostbite_stun':
            modifiedStats.frostbiteStun = (modifiedStats.frostbiteStun || 0) + ability.value;
            break;
          case 'cold_embrace_defense':
            modifiedStats.coldEmbraceDefense = (modifiedStats.coldEmbraceDefense || 0) + (ability.value / 100);
            break;
          
          case 'shield_aura':
            modifiedStats.shieldAura = (modifiedStats.shieldAura || 0) + ability.value;
            break;
          case 'shield_resistance':
            modifiedStats.shieldResistance = (modifiedStats.shieldResistance || 0) + (ability.value / 100);
            break;
          case 'ultimate_shield':
            modifiedStats.ultimateShield = (modifiedStats.ultimateShield || 0) + ability.value;
            break;
          case 'battle_start_shield':
            modifiedStats.battleStartShield = (modifiedStats.battleStartShield || 0) + ability.value;
            break;
          case 'shield_damage_chance':
            modifiedStats.shieldDamageChance = (modifiedStats.shieldDamageChance || 0) + (ability.value / 100);
            break;
          case 'high_damage_shield':
            modifiedStats.highDamageShield = (modifiedStats.highDamageShield || 0) + ability.value;
            break;
          case 'death_immunity_shield':
            modifiedStats.deathImmunityShield = (modifiedStats.deathImmunityShield || 0) + ability.value;
            break;
          case 'status_shield_cleanse':
            modifiedStats.statusShieldCleanse = (modifiedStats.statusShieldCleanse || 0) + (ability.value / 100);
            break;
          case 'shield_loss_damage':
            modifiedStats.shieldLossDamage = (modifiedStats.shieldLossDamage || 0) + (ability.value / 100);
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
        manaRegeneration: modifiedStats.manaRegeneration || 0,
        attackSpeed: modifiedStats.attackSpeed || 0,
        goldBonus: modifiedStats.goldBonus || 0,
        counterChance: modifiedStats.counterChance || 0,
        lowHealthDamageBonus: modifiedStats.lowHealthDamageBonus || 0,
        damageImmunityChance: modifiedStats.damageImmunityChance || 0,
        abilityCooldownReduction: modifiedStats.abilityCooldownReduction || 0,
        deathSaveCharges: modifiedStats.deathSaveCharges || 0
      }
    };
  }
}
