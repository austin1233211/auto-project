import { BaseEffect } from '../../base-effect.js';

export class CritHealEffect extends BaseEffect {
  apply(stats) {
    stats.critHealAmount = (stats.critHealAmount || 0) + this.value;
  }
}
