import { BaseEffect } from '../../base-effect.js';

export class HpLossPoisonEffect extends BaseEffect {
  apply(stats) {
    stats.hpLossPoisonRate = (stats.hpLossPoisonRate || 0) + (this.value / 100);
  }
}
