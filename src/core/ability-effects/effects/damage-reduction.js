import { BaseEffect } from '../base-effect.js';

export class DamageReductionEffect extends BaseEffect {
  apply(stats) {
    stats.damageReduction = (stats.damageReduction || 0) + (this.value / 100);
  }
}
