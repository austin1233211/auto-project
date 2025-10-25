import { BaseEffect } from '../base-effect.js';

export class HpLossDamageReductionEffect extends BaseEffect {
  apply(stats) {
    stats.hpLossDamageReduction = (stats.hpLossDamageReduction || 0) + (this.value / 100);
  }
}
