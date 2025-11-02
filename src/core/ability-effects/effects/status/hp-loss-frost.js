import { BaseEffect } from '../../base-effect.js';

export class HpLossFrostEffect extends BaseEffect {
  apply(stats) {
    stats.hpLossFrostRate = (stats.hpLossFrostRate || 0) + (this.value / 100);
  }
}
