import { BaseEffect } from '../base-effect.js';

export class HpSacrificeDamageEffect extends BaseEffect {
  apply(stats) {
    stats.hpSacrificeDamage = (stats.hpSacrificeDamage || 0) + (this.value / 100);
  }
}
