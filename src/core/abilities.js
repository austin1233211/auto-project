const ABILITY_CONFIG = {
  CHARGE: {
    damageMultiplier: 1.4,
    stunDuration: 1,
    emoji: '⚡',
    message: 'charges forward with devastating force',
    damageType: 'physical'
  },
  SHIELD_BLOCK: {
    damageReduction: 0.5,
    duration: 3,
    emoji: '🛡️',
    message: 'raises shield to block incoming attacks',
    damageType: 'none'
  },
  BERSERKER: {
    healthThreshold: 0.3,
    attackSpeedBonus: 0.5,
    duration: 5,
    emoji: '🔴',
    message: 'enters berserker rage',
    damageType: 'none'
  },
  
  FIREBALL: {
    damageMultiplier: 1.6,
    burnDamagePercent: 0.3,
    burnDuration: 3,
    emoji: '🔥',
    message: 'launches a burning Fireball',
    damageType: 'magic'
  },
  MAGIC_SHIELD: {
    absorptionCount: 3,
    emoji: '🔮',
    message: 'conjures a magical shield',
    damageType: 'none'
  },
  TELEPORT: {
    dodgeChance: 0.5,
    duration: 2,
    emoji: '✨',
    message: 'teleports to avoid attacks',
    damageType: 'none'
  },
  
  MULTI_SHOT: {
    arrowCount: 3,
    damagePerArrow: 0.7,
    emoji: '🏹',
    message: 'fires multiple arrows',
    damageType: 'physical'
  },
  EVASION: {
    dodgeChance: 0.75,
    duration: 2,
    emoji: '💨',
    message: 'enters evasive stance',
    damageType: 'none'
  },
  POISON_ARROW: {
    damageMultiplier: 1.0,
    poisonDamagePercent: 0.25,
    poisonDuration: 4,
    emoji: '🏹',
    message: 'shoots a poison-tipped arrow',
    damageType: 'physical'
  },
  
  BACKSTAB: {
    damageMultiplier: 2.5,
    emoji: '🗡️',
    message: 'strikes with deadly precision',
    damageType: 'physical'
  },
  STEALTH: {
    nextAttackMultiplier: 2.0,
    untargetableDuration: 1,
    emoji: '👤',
    message: 'vanishes into the shadows',
    damageType: 'none'
  },
  POISON_BLADE: {
    poisonDamagePercent: 0.2,
    poisonDuration: 3,
    buffDuration: 3,
    emoji: '🗡️',
    message: 'coats blade with deadly poison',
    damageType: 'physical'
  },
  
  HOLY_STRIKE: {
    damageMultiplier: 1.8,
    ignoreArmor: true,
    emoji: '⚡',
    message: 'strikes with divine power',
    damageType: 'magic'
  },
  HEAL: {
    healPercent: 0.3,
    healOverTimeDuration: 3,
    emoji: '✨',
    message: 'channels divine healing energy',
    damageType: 'none'
  },
  DIVINE_SHIELD: {
    immunityDuration: 2,
    emoji: '🛡️',
    message: 'becomes blessed with divine protection',
    damageType: 'none'
  },
  
  LIFE_DRAIN: {
    damageMultiplier: 1.2,
    healPercent: 0.5,
    emoji: '💀',
    message: 'drains life force',
    damageType: 'magic'
  },
  SUMMON_SKELETON: {
    skeletonAttackPercent: 0.5,
    skeletonDuration: 3,
    emoji: '💀',
    message: 'summons an undead skeleton',
    damageType: 'magic'
  },
  DEATH_COIL: {
    damageMultiplier: 1.3,
    healPercent: 0.4,
    healthThreshold: 0.5,
    emoji: '💀',
    message: 'channels dark energy',
    damageType: 'magic'
  },
  
  GENERIC: {
    damageMultiplier: 1.5,
    emoji: '✨',
    message: 'uses',
    damageType: 'physical'
  }
};

export class AbilitySystem {
  constructor(combat) {
    this.combat = combat;
  }

  executeAbility(caster, target, abilityName) {
    switch (abilityName) {
      case 'Charge':
        return this.executeCharge(caster, target);
      case 'Shield Block':
        return this.executeShieldBlock(caster, target);
      case 'Berserker':
        return this.executeBerserker(caster, target);
      
      case 'Fireball':
        return this.executeFireball(caster, target);
      case 'Magic Shield':
        return this.executeMagicShield(caster, target);
      case 'Teleport':
        return this.executeTeleport(caster, target);
      
      case 'Multi-Shot':
        return this.executeMultiShot(caster, target);
      case 'Evasion':
        return this.executeEvasion(caster, target);
      case 'Poison Arrow':
        return this.executePoisonArrow(caster, target);
      
      case 'Backstab':
        return this.executeBackstab(caster, target);
      case 'Stealth':
        return this.executeStealth(caster, target);
      case 'Poison Blade':
        return this.executePoisonBlade(caster, target);
      
      case 'Holy Strike':
        return this.executeHolyStrike(caster, target);
      case 'Heal':
        return this.executeHeal(caster, target);
      case 'Divine Shield':
        return this.executeDivineShield(caster, target);
      
      case 'Life Drain':
        return this.executeLifeDrain(caster, target);
      case 'Summon Skeleton':
        return this.executeSummonSkeleton(caster, target);
      case 'Death Coil':
        return this.executeDeathCoil(caster, target);
      
      default:
        return this.executeGenericAbility(caster, target, abilityName);
    }
  }

  processPassiveAbility(hero, target) {
    if (!hero.abilities || !hero.abilities.passive) return;
    
    const passiveName = hero.abilities.passive.name;
    
    switch (passiveName) {
      case 'Warrior Training':
        if (hero.currentHealth / hero.stats.health < 0.5) {
          if (!hero.statusEffects) hero.statusEffects = [];
          const hasEffect = hero.statusEffects.some(effect => effect.type === 'damage_reduction');
          if (!hasEffect) {
            this.applyDamageReductionEffect(hero, 0.2, 1);
          }
        }
        break;
      case 'Arcane Mastery':
        hero.currentMana = Math.min(hero.maxMana, hero.currentMana + 5);
        break;
      case 'Eagle Eye':
        if (Math.random() < 0.15) {
          this.combat.addToLog(`🎯 ${hero.name}'s Eagle Eye grants a precision strike!`);
          return { criticalHit: true };
        }
        break;
      case 'Shadow Step':
        if (Math.random() < 0.1) {
          this.applyDodgeEffect(hero, 1.0, 1);
        }
        break;
      case 'Divine Blessing':
        if (hero.currentHealth / hero.stats.health < 0.3) {
          const healAmount = Math.round(hero.stats.health * 0.05);
          hero.currentHealth = Math.min(hero.stats.health, hero.currentHealth + healAmount);
        }
        break;
      case 'Dark Aura':
        break;
    }
    
    return null;
  }

  executeFireball(caster, target) {
    const config = ABILITY_CONFIG.FIREBALL;
    const baseDamage = caster.effectiveStats.attack * config.damageMultiplier;
    const damage = this.combat.calculateDamage(baseDamage, target, config.damageType);
    
    target.currentHealth = Math.max(0, target.currentHealth - damage);
    
    const burnDamage = Math.round(damage * config.burnDamagePercent);
    this.applyBurnEffect(target, burnDamage, config.burnDuration);
    
    this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} for ${damage} damage! Target burns for ${burnDamage} damage over ${config.burnDuration} turns.`);
    
    return {
      damage: damage,
      effects: [`burn:${burnDamage}:${config.burnDuration}`]
    };
  }

  executeCharge(caster, target) {
    const config = ABILITY_CONFIG.CHARGE;
    const baseDamage = caster.effectiveStats.attack * config.damageMultiplier;
    const damage = this.combat.calculateDamage(baseDamage, target, config.damageType);
    
    target.currentHealth = Math.max(0, target.currentHealth - damage);
    this.applyStunEffect(target, config.stunDuration);
    
    this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} for ${damage} damage! Target is stunned for ${config.stunDuration} turn(s).`);
    
    return {
      damage: damage,
      effects: [`stun:${config.stunDuration}`]
    };
  }

  executeShieldBlock(caster, target) {
    const config = ABILITY_CONFIG.SHIELD_BLOCK;
    this.applyDamageReductionEffect(caster, config.damageReduction, config.duration);
    
    this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} reducing damage by ${Math.round(config.damageReduction * 100)}% for ${config.duration} turns!`);
    
    return {
      damage: 0,
      effects: [`damage_reduction:${config.damageReduction}:${config.duration}`]
    };
  }

  executeBerserker(caster, target) {
    const config = ABILITY_CONFIG.BERSERKER;
    const healthPercent = caster.currentHealth / caster.stats.health;
    
    if (healthPercent <= config.healthThreshold) {
      this.applyAttackSpeedEffect(caster, config.attackSpeedBonus, config.duration);
      this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} gaining ${Math.round(config.attackSpeedBonus * 100)}% attack speed for ${config.duration} turns!`);
      
      return {
        damage: 0,
        effects: [`attack_speed:${config.attackSpeedBonus}:${config.duration}`]
      };
    } else {
      this.combat.addToLog(`${caster.name} is not wounded enough to enter berserker rage!`);
      return this.executeGenericAbility(caster, target, 'Berserker');
    }
  }

  executeMagicShield(caster, target) {
    const config = ABILITY_CONFIG.MAGIC_SHIELD;
    this.applyAbsorptionEffect(caster, config.absorptionCount);
    
    this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} that will absorb the next ${config.absorptionCount} attacks!`);
    
    return {
      damage: 0,
      effects: [`absorption:${config.absorptionCount}`]
    };
  }

  executeTeleport(caster, target) {
    const config = ABILITY_CONFIG.TELEPORT;
    this.applyDodgeEffect(caster, config.dodgeChance, config.duration);
    
    this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} gaining ${Math.round(config.dodgeChance * 100)}% dodge chance for ${config.duration} turns!`);
    
    return {
      damage: 0,
      effects: [`dodge:${config.dodgeChance}:${config.duration}`]
    };
  }

  executeMultiShot(caster, target) {
    const config = ABILITY_CONFIG.MULTI_SHOT;
    let totalDamage = 0;
    
    for (let i = 0; i < config.arrowCount; i++) {
      const baseDamage = caster.effectiveStats.attack * config.damagePerArrow;
      const damage = this.combat.calculateDamage(baseDamage, target, config.damageType);
      totalDamage += damage;
      target.currentHealth = Math.max(0, target.currentHealth - damage);
    }
    
    this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} dealing ${totalDamage} total damage in ${config.arrowCount} hits!`);
    
    return {
      damage: totalDamage,
      effects: [`multishot:${config.arrowCount}`]
    };
  }

  executeEvasion(caster, target) {
    const config = ABILITY_CONFIG.EVASION;
    this.applyDodgeEffect(caster, config.dodgeChance, config.duration);
    
    this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} gaining ${Math.round(config.dodgeChance * 100)}% dodge chance for ${config.duration} turns!`);
    
    return {
      damage: 0,
      effects: [`dodge:${config.dodgeChance}:${config.duration}`]
    };
  }

  executePoisonArrow(caster, target) {
    const config = ABILITY_CONFIG.POISON_ARROW;
    const baseDamage = caster.effectiveStats.attack * config.damageMultiplier;
    const damage = this.combat.calculateDamage(baseDamage, target, config.damageType);
    const poisonDamage = Math.round(damage * config.poisonDamagePercent);
    
    target.currentHealth = Math.max(0, target.currentHealth - damage);
    this.applyPoisonEffect(target, poisonDamage, config.poisonDuration);
    
    this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} for ${damage} damage! Target is poisoned for ${poisonDamage} damage over ${config.poisonDuration} turns.`);
    
    return {
      damage: damage,
      effects: [`poison:${poisonDamage}:${config.poisonDuration}`]
    };
  }

  executeBackstab(caster, target) {
    const config = ABILITY_CONFIG.BACKSTAB;
    const baseDamage = caster.effectiveStats.attack * config.damageMultiplier;
    const damage = this.combat.calculateDamage(baseDamage, target, config.damageType);
    
    target.currentHealth = Math.max(0, target.currentHealth - damage);
    
    this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} for ${damage} critical damage!`);
    
    return {
      damage: damage,
      effects: [`critical`]
    };
  }

  executeStealth(caster, target) {
    const config = ABILITY_CONFIG.STEALTH;
    this.applyStealthEffect(caster, config.nextAttackMultiplier, config.untargetableDuration);
    
    this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} - next attack will deal ${Math.round(config.nextAttackMultiplier * 100)}% damage!`);
    
    return {
      damage: 0,
      effects: [`stealth:${config.nextAttackMultiplier}:${config.untargetableDuration}`]
    };
  }

  executePoisonBlade(caster, target) {
    const config = ABILITY_CONFIG.POISON_BLADE;
    this.applyPoisonBladeEffect(caster, config.poisonDamagePercent, config.poisonDuration, config.buffDuration);
    
    this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} - attacks will apply poison for ${config.buffDuration} turns!`);
    
    return {
      damage: 0,
      effects: [`poison_blade:${config.poisonDamagePercent}:${config.poisonDuration}:${config.buffDuration}`]
    };
  }

  executeHolyStrike(caster, target) {
    const config = ABILITY_CONFIG.HOLY_STRIKE;
    const baseDamage = caster.effectiveStats.attack * config.damageMultiplier;
    const damage = config.ignoreArmor ? baseDamage : this.combat.calculateDamage(baseDamage, target, config.damageType);
    
    target.currentHealth = Math.max(0, target.currentHealth - damage);
    
    this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} for ${damage} divine damage${config.ignoreArmor ? ' (ignoring armor)' : ''}!`);
    
    return {
      damage: damage,
      effects: [`holy_damage`]
    };
  }

  executeHeal(caster, target) {
    const config = ABILITY_CONFIG.HEAL;
    let healAmount = Math.round(caster.stats.health * config.healPercent);
    
    if (caster.lowHpHealActive && Date.now() - caster.lowHpHealTimer < 5000) {
      healAmount *= 2;
    }
    
    caster.currentHealth = Math.min(caster.stats.health, caster.currentHealth + healAmount);
    
    this.triggerAbilities(caster, target, 'on_heal');
    this.triggerAbilities(caster, target, 'heal_threshold_check', { healAmount: healAmount });
    
    if (!caster.healingDoneThisSecond) caster.healingDoneThisSecond = 0;
    if (!caster.healingDoneThisRound) caster.healingDoneThisRound = 0;
    caster.healingDoneThisSecond += healAmount;
    caster.healingDoneThisRound += healAmount;
    
    this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} and restores ${healAmount} health!`);
    
    return {
      damage: 0,
      effects: [`heal:${healAmount}`]
    };
  }

  executeDivineShield(caster, target) {
    const config = ABILITY_CONFIG.DIVINE_SHIELD;
    this.applyImmunityEffect(caster, config.immunityDuration);
    
    this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} for ${config.immunityDuration} turns!`);
    
    return {
      damage: 0,
      effects: [`immunity:${config.immunityDuration}`]
    };
  }

  executeLifeDrain(caster, target) {
    const config = ABILITY_CONFIG.LIFE_DRAIN;
    const baseDamage = caster.effectiveStats.attack * config.damageMultiplier;
    const damage = this.combat.calculateDamage(baseDamage, target, config.damageType);
    const healAmount = Math.round(damage * config.healPercent);
    
    target.currentHealth = Math.max(0, target.currentHealth - damage);
    caster.currentHealth = Math.min(caster.stats.health, caster.currentHealth + healAmount);
    
    this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} for ${damage} damage and heals for ${healAmount}!`);
    
    return {
      damage: damage,
      effects: [`lifedrain:${healAmount}`]
    };
  }

  executeSummonSkeleton(caster, target) {
    const config = ABILITY_CONFIG.SUMMON_SKELETON;
    this.applySkeletonEffect(caster, target, config.skeletonAttackPercent, config.skeletonDuration);
    
    this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} that will attack for ${config.skeletonDuration} turns!`);
    
    return {
      damage: 0,
      effects: [`skeleton:${config.skeletonAttackPercent}:${config.skeletonDuration}`]
    };
  }

  executeDeathCoil(caster, target) {
    const config = ABILITY_CONFIG.DEATH_COIL;
    const healthPercent = caster.currentHealth / caster.stats.health;
    
    if (healthPercent < config.healthThreshold) {
      const healAmount = Math.round(caster.stats.health * config.healPercent);
      caster.currentHealth = Math.min(caster.stats.health, caster.currentHealth + healAmount);
      
      this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} to heal for ${healAmount} health!`);
      
      return {
        damage: 0,
        effects: [`heal:${healAmount}`]
      };
    } else {
      const baseDamage = caster.effectiveStats.attack * config.damageMultiplier;
      const damage = this.combat.calculateDamage(baseDamage, target, config.damageType);
      
      target.currentHealth = Math.max(0, target.currentHealth - damage);
      
      this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} to damage enemy for ${damage}!`);
      
      return {
        damage: damage,
        effects: [`death_coil_damage`]
      };
    }
  }

  executeGenericAbility(caster, target, abilityName) {
    const config = ABILITY_CONFIG.GENERIC;
    const damage = this.combat.calculateDamage(caster.effectiveStats.attack * config.damageMultiplier, target, config.damageType);
    target.currentHealth = Math.max(0, target.currentHealth - damage);
    this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} ${abilityName} for ${damage} damage!`);
    
    return {
      damage: damage,
      effects: []
    };
  }

  applyBurnEffect(target, burnDamage, duration) {
    if (!target.statusEffects) {
      target.statusEffects = [];
    }
    
    target.statusEffects.push({
      type: 'burn',
      damage: burnDamage,
      duration: duration,
      ticksRemaining: duration
    });
  }

  applyStunEffect(target, duration) {
    if (!target.statusEffects) {
      target.statusEffects = [];
    }
    
    target.statusEffects.push({
      type: 'stun',
      duration: duration,
      ticksRemaining: duration
    });
  }

  applyPoisonEffect(target, poisonDamage, duration) {
    if (!target.statusEffects) {
      target.statusEffects = [];
    }
    
    target.statusEffects.push({
      type: 'poison',
      damage: poisonDamage,
      duration: duration,
      ticksRemaining: duration
    });
  }

  applyDamageReductionEffect(target, reduction, duration) {
    if (!target.statusEffects) {
      target.statusEffects = [];
    }
    
    target.statusEffects.push({
      type: 'damage_reduction',
      reduction: reduction,
      duration: duration,
      ticksRemaining: duration
    });
  }

  applyAttackSpeedEffect(target, bonus, duration) {
    if (!target.statusEffects) {
      target.statusEffects = [];
    }
    
    target.statusEffects.push({
      type: 'attack_speed',
      bonus: bonus,
      duration: duration,
      ticksRemaining: duration
    });
  }

  applyAbsorptionEffect(target, count) {
    if (!target.statusEffects) {
      target.statusEffects = [];
    }
    
    target.statusEffects.push({
      type: 'absorption',
      count: count,
      ticksRemaining: count
    });
  }

  applyDodgeEffect(target, chance, duration) {
    if (!target.statusEffects) {
      target.statusEffects = [];
    }
    
    target.statusEffects.push({
      type: 'dodge',
      chance: chance,
      duration: duration,
      ticksRemaining: duration
    });
  }

  applyStealthEffect(target, attackMultiplier, duration) {
    if (!target.statusEffects) {
      target.statusEffects = [];
    }
    
    target.statusEffects.push({
      type: 'stealth',
      attackMultiplier: attackMultiplier,
      duration: duration,
      ticksRemaining: duration
    });
  }

  applyPoisonBladeEffect(target, poisonPercent, poisonDuration, buffDuration) {
    if (!target.statusEffects) {
      target.statusEffects = [];
    }
    
    target.statusEffects.push({
      type: 'poison_blade',
      poisonPercent: poisonPercent,
      poisonDuration: poisonDuration,
      duration: buffDuration,
      ticksRemaining: buffDuration
    });
  }

  applyImmunityEffect(target, duration) {
    if (!target.statusEffects) {
      target.statusEffects = [];
    }
    
    target.statusEffects.push({
      type: 'immunity',
      duration: duration,
      ticksRemaining: duration
    });
  }

  applySkeletonEffect(caster, target, attackPercent, duration) {
    if (!caster.statusEffects) {
      caster.statusEffects = [];
    }
    
    caster.statusEffects.push({
      type: 'skeleton',
      target: target,
      attackPercent: attackPercent,
      duration: duration,
      ticksRemaining: duration
    });
  }

  processStatusEffects(hero) {
    if (!hero.statusEffects) return;
    
    const activeEffects = [];
    const now = Date.now();
    
    for (const effect of hero.statusEffects) {
      if (effect.type === 'poison_stacks') {
        if (!effect.lastTick) effect.lastTick = now;
        
        if (now - effect.lastTick >= 1000) {
          const damage = Math.max(1, Math.floor(effect.stacks));
          hero.currentHealth = Math.max(0, hero.currentHealth - damage);
          this.combat.addToLog(`☠️ ${hero.name} takes ${damage} poison damage from ${effect.stacks} stacks!`);
          
          effect.stacks = Math.floor(effect.stacks * 0.7);
          effect.lastTick = now;
        }
        
        if (effect.stacks >= 1) activeEffects.push(effect);
      } else if (effect.type === 'frost_stacks') {
        if (!effect.lastTick) effect.lastTick = now;
        
        if (now - effect.lastTick >= 1000) {
          effect.stacks = Math.floor(effect.stacks * 0.7);
          effect.lastTick = now;
        }
        
        if (effect.stacks >= 1) activeEffects.push(effect);
      } else if (effect.type === 'shield_stacks') {
        if (effect.stacks >= 1) activeEffects.push(effect);
      } else if (effect.ticksRemaining > 0) {
        if (effect.type === 'burn') {
          const escalatedDamage = Math.round(effect.damage * this.combat.damageMultiplier);
          hero.currentHealth = Math.max(0, hero.currentHealth - escalatedDamage);
          this.combat.addToLog(`🔥 ${hero.name} takes ${escalatedDamage} burn damage!`);
        } else if (effect.type === 'poison') {
          const escalatedDamage = Math.round(effect.damage * this.combat.damageMultiplier);
          hero.currentHealth = Math.max(0, hero.currentHealth - escalatedDamage);
          this.combat.addToLog(`☠️ ${hero.name} takes ${escalatedDamage} poison damage!`);
        } else if (effect.type === 'skeleton' && effect.target) {
          const skeletonDamage = Math.round(hero.effectiveStats.attack * effect.attackPercent);
          const damage = this.combat.calculateDamage(skeletonDamage, effect.target.effectiveStats.armor);
          effect.target.currentHealth = Math.max(0, effect.target.currentHealth - damage);
          this.combat.addToLog(`💀 ${hero.name}'s skeleton attacks for ${damage} damage!`);
        }
        
        effect.ticksRemaining--;
        
        if (effect.ticksRemaining > 0) {
          activeEffects.push(effect);
        } else {
          this.combat.addToLog(`${hero.name} recovers from ${effect.type}.`);
        }
      }
    }
    
    hero.statusEffects = activeEffects;
  }

  applyPoisonStacks(target, stacks) {
    if (!target.statusEffects) target.statusEffects = [];
    
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

  applyFrostStacks(target, stacks) {
    if (!target.statusEffects) target.statusEffects = [];
    
    let existingFrost = target.statusEffects.find(e => e.type === 'frost_stacks');
    if (existingFrost) {
      existingFrost.stacks += stacks;
    } else {
      target.statusEffects.push({
        type: 'frost_stacks',
        stacks: stacks,
        lastTick: Date.now()
      });
    }
  }

  applyShieldStacks(target, stacks) {
    if (!target.statusEffects) target.statusEffects = [];
    
    let existingShield = target.statusEffects.find(e => e.type === 'shield_stacks');
    if (existingShield) {
      existingShield.stacks += stacks;
    } else {
      target.statusEffects.push({
        type: 'shield_stacks',
        stacks: stacks
      });
    }
  }

  triggerAbilities(hero, target, triggerType, extraData = {}) {
    if (!hero.purchasedAbilities) return;
    
    for (const ability of hero.purchasedAbilities) {
      switch (ability.effect) {
        case 'attack_poison_chance':
          if (triggerType === 'on_attack' && Math.random() < (ability.value / 100)) {
            this.applyPoisonStacks(target, 4);
            this.combat.addToLog(`${hero.name}'s ${ability.name} applies poison!`);
          }
          break;
        case 'attack_frost_chance':
          if (triggerType === 'on_attack' && Math.random() < (ability.value / 100)) {
            this.applyFrostStacks(target, 5);
            this.combat.addToLog(`${hero.name}'s ${ability.name} applies frost!`);
          }
          break;
        case 'attack_shield_chance':
          if (triggerType === 'on_attack' && Math.random() < (ability.value / 100)) {
            this.applyShieldStacks(hero, 4);
            this.combat.addToLog(`${hero.name}'s ${ability.name} grants shield!`);
          }
          break;
        case 'attack_heal_chance':
          if (triggerType === 'on_attack' && Math.random() < (ability.value / 100)) {
            hero.currentHealth = Math.min(hero.stats.health, hero.currentHealth + 10);
            this.combat.addToLog(`${hero.name}'s ${ability.name} restores 10 HP!`);
          }
          break;
        case 'attack_mana_restore':
          if (triggerType === 'on_attack' && Math.random() < (ability.value / 100)) {
            hero.currentMana = Math.min(hero.maxMana, hero.currentMana + 3);
            this.combat.addToLog(`${hero.name}'s ${ability.name} restores 3 mana!`);
          }
          break;
        case 'evade_poison':
          if (triggerType === 'on_evade') {
            this.applyPoisonStacks(target, 4);
            this.combat.addToLog(`${hero.name}'s ${ability.name} applies poison on evade!`);
          }
          break;
        case 'evade_frost':
          if (triggerType === 'on_evade') {
            this.applyFrostStacks(target, 5);
            this.combat.addToLog(`${hero.name}'s ${ability.name} applies frost on evade!`);
          }
          break;
        case 'evade_heal':
          if (triggerType === 'on_evade') {
            hero.currentHealth = Math.min(hero.stats.health, hero.currentHealth + 10);
            this.combat.addToLog(`${hero.name}'s ${ability.name} restores HP on evade!`);
          }
          break;
        case 'evade_shield':
          if (triggerType === 'on_evade') {
            this.applyShieldStacks(hero, 4);
            this.combat.addToLog(`${hero.name}'s ${ability.name} grants shield on evade!`);
          }
          break;
        case 'crit_poison':
          if (triggerType === 'on_crit') {
            this.applyPoisonStacks(target, 4);
            this.combat.addToLog(`${hero.name}'s ${ability.name} applies poison on crit!`);
          }
          break;
        case 'crit_frost':
          if (triggerType === 'on_crit') {
            this.applyFrostStacks(target, 5);
            this.combat.addToLog(`${hero.name}'s ${ability.name} applies frost on crit!`);
          }
          break;
        case 'crit_shield':
          if (triggerType === 'on_crit') {
            this.applyShieldStacks(hero, 4);
            this.combat.addToLog(`${hero.name}'s ${ability.name} grants shield on crit!`);
          }
          break;
        case 'crit_heal':
          if (triggerType === 'on_crit') {
            hero.currentHealth = Math.min(hero.stats.health, hero.currentHealth + ability.value);
            this.combat.addToLog(`${hero.name}'s ${ability.name} restores ${ability.value} HP on crit!`);
          }
          break;
        case 'poison_aura':
          if (triggerType === 'status_tick') {
            this.applyPoisonStacks(target, ability.value);
          }
          break;
        case 'frost_aura':
          if (triggerType === 'status_tick') {
            this.applyFrostStacks(target, ability.value);
          }
          break;
        case 'shield_aura':
          if (triggerType === 'status_tick') {
            this.applyShieldStacks(hero, ability.value);
          }
          break;
        case 'health_regen_flat':
          if (triggerType === 'status_tick') {
            hero.currentHealth = Math.min(hero.stats.health, hero.currentHealth + ability.value);
          }
          break;
        case 'enhanced_regen':
          if (triggerType === 'enhanced_tick') {
            hero.currentHealth = Math.min(hero.stats.health, hero.currentHealth + ability.value);
          }
          break;
        case 'battle_start_poison':
          if (triggerType === 'battle_start') {
            this.applyPoisonStacks(target, ability.value);
            this.combat.addToLog(`${hero.name}'s ${ability.name} applies ${ability.value} poison stacks at battle start!`);
          }
          break;
        case 'battle_start_frost':
          if (triggerType === 'battle_start') {
            this.applyFrostStacks(target, ability.value);
            this.combat.addToLog(`${hero.name}'s ${ability.name} applies ${ability.value} frost stacks at battle start!`);
          }
          break;
        case 'battle_start_shield':
          if (triggerType === 'battle_start') {
            this.applyShieldStacks(hero, ability.value);
            this.combat.addToLog(`${hero.name}'s ${ability.name} grants ${ability.value} shield stacks at battle start!`);
          }
          break;
        case 'ultimate_poison':
          if (triggerType === 'on_ultimate') {
            this.applyPoisonStacks(target, ability.value);
            this.combat.addToLog(`${hero.name}'s ${ability.name} applies ${ability.value} poison stacks on ultimate!`);
          }
          break;
        case 'ultimate_frost':
          if (triggerType === 'on_ultimate') {
            this.applyFrostStacks(target, ability.value);
            this.combat.addToLog(`${hero.name}'s ${ability.name} applies ${ability.value} frost stacks on ultimate!`);
          }
          break;
        case 'ultimate_shield':
          if (triggerType === 'on_ultimate') {
            this.applyShieldStacks(hero, ability.value);
            this.combat.addToLog(`${hero.name}'s ${ability.name} grants ${ability.value} shield stacks on ultimate!`);
          }
          break;
        case 'death_immunity_shield':
          if (triggerType === 'death_save') {
            if (!hero.deathImmunityUsed) {
              hero.deathImmunityUsed = true;
              hero.currentHealth = 1;
              this.applyShieldStacks(hero, ability.value);
              this.combat.addToLog(`${hero.name}'s ${ability.name} activates - immune to death with massive shield!`);
              return true;
            }
          }
          break;
        case 'high_damage_shield':
          if (triggerType === 'high_damage_taken' && extraData.damageAmount > 80) {
            this.applyShieldStacks(hero, ability.value);
            this.combat.addToLog(`${hero.name}'s ${ability.name} grants ${ability.value} shield stacks from high damage!`);
          }
          break;
        case 'hp_magic_damage_growth':
          if (triggerType === 'drums_tick') {
            const damage = Math.round(hero.stats.health * (ability.value / 100));
            target.currentHealth = Math.max(0, target.currentHealth - damage);
            hero.stats.health = Math.min(hero.stats.health + 200, hero.stats.health + 1000);
            this.combat.addToLog(`${hero.name}'s ${ability.name} deals ${damage} magic damage and grows stronger!`);
          }
          break;
        case 'frost_nova_damage':
          if (triggerType === 'frost_nova_tick') {
            const frostStacks = target.statusEffects?.find(e => e.type === 'frost_stacks')?.stacks || 0;
            const damage = ability.value + frostStacks;
            target.currentHealth = Math.max(0, target.currentHealth - damage);
            this.combat.addToLog(`${hero.name}'s ${ability.name} deals ${damage} frost damage!`);
          }
          break;
        case 'shield_loss_damage':
          if (triggerType === 'shield_loss_tick') {
            if (!hero.shieldLossTracker) hero.shieldLossTracker = { lastShield: 0 };
            const currentShield = hero.statusEffects?.find(e => e.type === 'shield_stacks')?.stacks || 0;
            const shieldLost = Math.max(0, hero.shieldLossTracker.lastShield - currentShield);
            
            if (shieldLost > 0) {
              const damage = Math.round(shieldLost * (ability.value / 100));
              const shieldGain = Math.round(shieldLost * 0.15);
              
              target.currentHealth = Math.max(0, target.currentHealth - damage);
              this.applyShieldStacks(hero, shieldGain);
              this.combat.addToLog(`${hero.name}'s ${ability.name} deals ${damage} damage and grants ${shieldGain} shield!`);
            }
            
            hero.shieldLossTracker.lastShield = currentShield;
          }
          break;
        case 'coup_de_grace':
          if (triggerType === 'battle_start') {
            if (!hero.coupDeGraceState) {
              hero.coupDeGraceState = { critsRemaining: 3, originalCritChance: hero.effectiveStats.critChance };
              hero.effectiveStats.critChance = 1.0;
              this.combat.addToLog(`${hero.name}'s ${ability.name} grants temporary 100% crit chance!`);
            }
          } else if (triggerType === 'on_crit' && hero.coupDeGraceState && hero.coupDeGraceState.critsRemaining > 0) {
            hero.coupDeGraceState.critsRemaining--;
            if (hero.coupDeGraceState.critsRemaining <= 0) {
              hero.effectiveStats.critChance = hero.coupDeGraceState.originalCritChance;
              hero.coupDeGraceState = null;
              this.combat.addToLog(`${hero.name}'s ${ability.name} effect expires!`);
            }
          }
          break;
        case 'blade_dance':
          if (triggerType === 'on_crit') {
            const now = Date.now();
            if (!hero.bladeDanceLastUse || now - hero.bladeDanceLastUse >= 1500) {
              const hpDamage = Math.round(target.stats.health * (ability.value / 100));
              target.currentHealth = Math.max(0, target.currentHealth - hpDamage);
              
              if (!target.statusEffects) target.statusEffects = [];
              target.statusEffects.push({
                type: 'stun',
                duration: 500,
                startTime: now
              });
              
              hero.bladeDanceLastUse = now;
              this.combat.addToLog(`${hero.name}'s ${ability.name} stuns and deals ${hpDamage} HP damage!`);
            }
          }
          break;
      }
    }
    
    const equipment = hero.equipment || [];
    hero.equipmentState = hero.equipmentState || {};
    const now = Date.now();
    for (const item of equipment) {
      const fx = item.effects || {};
      if (triggerType === 'battle_start') {
        if (fx.manaOnBattleStart) {
          hero.currentMana = Math.min(hero.maxMana, (hero.currentMana || 0) + fx.manaOnBattleStart);
          if (this.combat && this.combat.addToLog) {
            this.combat.addToLog(`${hero.name}'s ${item.name} restores ${fx.manaOnBattleStart} mana at battle start!`);
          }
        }
      }
      if (triggerType === 'status_tick') {
        if (fx.periodicHeal && fx.periodicHeal.amount && fx.periodicHeal.intervalSec) {
          const k = `${item.type}_heal_last`;
          if (!hero.equipmentState[k] || now - hero.equipmentState[k] >= fx.periodicHeal.intervalSec * 1000) {
            hero.currentHealth = Math.min(hero.stats.health, (hero.currentHealth || 0) + fx.periodicHeal.amount);
            hero.equipmentState[k] = now;
            if (this.combat && this.combat.addToLog) {
              this.combat.addToLog(`${hero.name}'s ${item.name} heals ${fx.periodicHeal.amount} HP.`);
            }
          }
        }
        if (fx.perStack && fx.perStack.intervalSec && hero.persistentEffects && typeof hero.persistentEffects.mapleSyrupStacks === 'number') {
          const k = `${item.type}_stack_tick_last`;
          if (!hero.equipmentState[k] || now - hero.equipmentState[k] >= fx.perStack.intervalSec * 1000) {
            const stacks = hero.persistentEffects.mapleSyrupStacks;
            const healAmt = (fx.perStack.heal || 0) * stacks;
            const manaAmt = (fx.perStack.mana || 0) * stacks;
            if (healAmt) {
              hero.currentHealth = Math.min(hero.stats.health, (hero.currentHealth || 0) + healAmt);
            }
            if (manaAmt) {
              hero.currentMana = Math.min(hero.maxMana, (hero.currentMana || 0) + manaAmt);
            }
            hero.equipmentState[k] = now;
            if (this.combat && this.combat.addToLog && (healAmt || manaAmt)) {
              this.combat.addToLog(`${hero.name}'s ${item.name} restores ${healAmt} HP and ${manaAmt} mana from stacks.`);
            }
          }
        }
      }
      if (triggerType === 'on_ultimate') {
        if (fx.onEnemyUltimate && fx.onEnemyUltimate.manaRegenDelta && fx.onEnemyUltimate.durationSec) {
          if (target) {
            target.equipmentState = target.equipmentState || {};
            const debuffs = target.equipmentState.manaRegenDebuffs || [];
            debuffs.push({ delta: fx.onEnemyUltimate.manaRegenDelta, expires: now + fx.onEnemyUltimate.durationSec * 1000 });
            target.equipmentState.manaRegenDebuffs = debuffs;
            if (this.combat && this.combat.addToLog) {
              this.combat.addToLog(`${hero.name}'s ${item.name} reduces ${target.name}'s mana regen by ${Math.abs(fx.onEnemyUltimate.manaRegenDelta)} for ${fx.onEnemyUltimate.durationSec}s.`);
            }
          }
        }
      }
    for (const item of equipment) {
      const fx = item.effects || {};
      if (triggerType === 'status_tick') {
        if (fx.periodicDamage && fx.periodicDamage.amount && fx.periodicDamage.intervalSec) {
          const k = `${item.type}_dmg_last`;
          if (!hero.equipmentState[k] || now - hero.equipmentState[k] >= fx.periodicDamage.intervalSec * 1000) {
            const dmg = fx.periodicDamage.amount;
            target.currentHealth = Math.max(0, (target.currentHealth || 0) - dmg);
            hero.equipmentState[k] = now;
            if (this.combat && this.combat.addToLog) {
              this.combat.addToLog(`${hero.name}'s ${item.name} deals ${dmg} damage over time.`);
            }
          }
        }
        if (fx.periodicApplyPoison && fx.periodicApplyPoison.stacks && fx.periodicApplyPoison.intervalSec) {
          const k = `${item.type}_poison_last`;
          if (!hero.equipmentState[k] || now - hero.equipmentState[k] >= fx.periodicApplyPoison.intervalSec * 1000) {
            let stacks = fx.periodicApplyPoison.stacks;
            if (hero.persistentEffects && typeof hero.persistentEffects.urnPoisonIncrement === 'number') {
              stacks += hero.persistentEffects.urnPoisonIncrement;
            }
            this.applyPoisonStacks(target, stacks);
            hero.equipmentState[k] = now;
            if (this.combat && this.combat.addToLog) {
              this.combat.addToLog(`${hero.name}'s ${item.name} applies ${stacks} poison stacks.`);
            }
          }
        }
      }
      if (triggerType === 'low_hp_check') {
        if (fx.shieldThreshold && fx.shieldThreshold.hpPct && fx.shieldThreshold.stacks) {
          const usedKey = `${item.type}_threshold_used`;
          const hpPct = (hero.currentHealth / hero.stats.health) * 100;
          if (!hero.equipmentState[usedKey] && hpPct <= fx.shieldThreshold.hpPct) {
            this.applyShieldStacks(hero, fx.shieldThreshold.stacks);
            hero.equipmentState[usedKey] = fx.shieldThreshold.oncePerBattle ? true : false;
            if (this.combat && this.combat.addToLog) {
              this.combat.addToLog(`${hero.name}'s ${item.name} grants ${fx.shieldThreshold.stacks} shield stacks at low HP!`);
            }
          }
        }
        if (fx.thresholdFrostBurst && fx.thresholdFrostBurst.hpPct && fx.thresholdFrostBurst.heal && fx.thresholdFrostBurst.enemyFrostStacks) {
          const usedKey = `${item.type}_threshold_used`;
          const hpPct = (hero.currentHealth / hero.stats.health) * 100;
          if (!hero.equipmentState[usedKey] && hpPct <= fx.thresholdFrostBurst.hpPct) {
            hero.currentHealth = Math.min(hero.stats.health, (hero.currentHealth || 0) + fx.thresholdFrostBurst.heal);
            this.applyFrostStacks(target, fx.thresholdFrostBurst.enemyFrostStacks);
            hero.equipmentState[usedKey] = fx.thresholdFrostBurst.oncePerBattle ? true : false;
            if (this.combat && this.combat.addToLog) {
              this.combat.addToLog(`${hero.name}'s ${item.name} restores ${fx.thresholdFrostBurst.heal} HP and applies ${fx.thresholdFrostBurst.enemyFrostStacks} frost stacks!`);
            }
          }
        }
      }
    }
    }
    if (triggerType === 'status_tick') {
      if (hero.equipmentState && Array.isArray(hero.equipmentState.manaRegenDebuffs)) {
        hero.equipmentState.manaRegenDebuffs = hero.equipmentState.manaRegenDebuffs.filter(d => d.expires > now);
      }
      if (target && target.equipmentState && Array.isArray(target.equipmentState.manaRegenDebuffs)) {
        target.equipmentState.manaRegenDebuffs = target.equipmentState.manaRegenDebuffs.filter(d => d.expires > now);
      }
    }

    return false;
  }
}
