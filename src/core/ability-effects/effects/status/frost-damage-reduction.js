import { BaseEffect } from '../../base-effect.js';

export class FrostDamageReductionEffect extends BaseEffect {
  apply(stats) {
    stats.frostDamageReduction = (stats.frostDamageReduction || 0) + (this.value / 100);
  }
}
