import { BaseEffect } from '../../base-effect.js';

export class PoisonHealConversionEffect extends BaseEffect {
  apply(stats) {
    stats.poisonHealConversion = (stats.poisonHealConversion || 0) + (this.value / 100);
  }
}
