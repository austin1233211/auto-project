/**
 * Ability configuration constants.
 * Contains damage multipliers, durations, and other tuning values for all abilities.
 */

export const ABILITY_CONFIG = {
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
