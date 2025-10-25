import { BaseEffect } from '../base-effect.js';

export class DamageImmunityEffect extends BaseEffect {
  apply(stats) {
    stats.damageImmunityChance = (stats.damageImmunityChance || 0) + (this.value / 100);
  }
}
