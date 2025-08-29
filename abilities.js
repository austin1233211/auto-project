const ABILITY_CONFIG = {
  FIREBALL: {
    damageMultiplier: 1.6,
    burnDamagePercent: 0.3,
    burnDuration: 3,
    emoji: '🔥',
    message: 'launches a burning Fireball'
  },
  CHARGE: {
    damageMultiplier: 1.4,
    stunDuration: 1,
    emoji: '⚡',
    message: 'charges forward with devastating force'
  },
  HEAL: {
    healPercent: 0.3,
    healOverTimeDuration: 3,
    emoji: '✨',
    message: 'channels divine healing energy'
  },
  LIFE_DRAIN: {
    damageMultiplier: 1.2,
    healPercent: 0.5,
    emoji: '💀',
    message: 'drains life force'
  },
  GENERIC: {
    damageMultiplier: 1.5,
    emoji: '✨',
    message: 'uses'
  }
};

export class AbilitySystem {
  constructor(combat) {
    this.combat = combat;
  }

  executeAbility(caster, target, abilityName) {
    switch (abilityName) {
      case 'Fireball':
        return this.executeFireball(caster, target);
      case 'Charge':
        return this.executeCharge(caster, target);
      case 'Heal':
        return this.executeHeal(caster, target);
      case 'Life Drain':
        return this.executeLifeDrain(caster, target);
      default:
        return this.executeGenericAbility(caster, target, abilityName);
    }
  }

  executeFireball(caster, target) {
    const config = ABILITY_CONFIG.FIREBALL;
    const baseDamage = caster.effectiveStats.attack * config.damageMultiplier;
    const damage = this.combat.calculateDamage(baseDamage, target.effectiveStats.armor);
    
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
    const damage = this.combat.calculateDamage(baseDamage, target.effectiveStats.armor);
    
    target.currentHealth = Math.max(0, target.currentHealth - damage);
    this.applyStunEffect(target, config.stunDuration);
    
    this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} for ${damage} damage! Target is stunned for ${config.stunDuration} turn(s).`);
    
    return {
      damage: damage,
      effects: [`stun:${config.stunDuration}`]
    };
  }

  executeHeal(caster, target) {
    const config = ABILITY_CONFIG.HEAL;
    const healAmount = Math.round(caster.stats.health * config.healPercent);
    
    caster.currentHealth = Math.min(caster.stats.health, caster.currentHealth + healAmount);
    
    this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} and restores ${healAmount} health!`);
    
    return {
      damage: 0,
      effects: [`heal:${healAmount}`]
    };
  }

  executeLifeDrain(caster, target) {
    const config = ABILITY_CONFIG.LIFE_DRAIN;
    const baseDamage = caster.effectiveStats.attack * config.damageMultiplier;
    const damage = this.combat.calculateDamage(baseDamage, target.effectiveStats.armor);
    const healAmount = Math.round(damage * config.healPercent);
    
    target.currentHealth = Math.max(0, target.currentHealth - damage);
    caster.currentHealth = Math.min(caster.stats.health, caster.currentHealth + healAmount);
    
    this.combat.addToLog(`${config.emoji} ${caster.name} ${config.message} for ${damage} damage and heals for ${healAmount}!`);
    
    return {
      damage: damage,
      effects: [`lifedrain:${healAmount}`]
    };
  }

  executeGenericAbility(caster, target, abilityName) {
    const config = ABILITY_CONFIG.GENERIC;
    const damage = this.combat.calculateDamage(caster.effectiveStats.attack * config.damageMultiplier, target.effectiveStats.armor);
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

  processStatusEffects(hero) {
    if (!hero.statusEffects) return;
    
    const activeEffects = [];
    
    for (const effect of hero.statusEffects) {
      if (effect.ticksRemaining > 0) {
        if (effect.type === 'burn') {
          hero.currentHealth = Math.max(0, hero.currentHealth - effect.damage);
          this.combat.addToLog(`🔥 ${hero.name} takes ${effect.damage} burn damage!`);
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
}
