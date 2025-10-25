import { BaseEffect } from '../base-effect.js';

export class EvasionDamageReductionEffect extends BaseEffect {
  apply(stats) {
    stats.evasionDamageReduction = (stats.evasionDamageReduction || 0) + (this.value / 100);
  }
}
