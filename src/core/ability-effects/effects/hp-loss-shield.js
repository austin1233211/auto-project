import { BaseEffect } from '../base-effect.js';

export class HpLossShieldEffect extends BaseEffect {
  apply(stats) {
    stats.hpLossShieldRate = (stats.hpLossShieldRate || 0) + (this.value / 100);
  }
}
