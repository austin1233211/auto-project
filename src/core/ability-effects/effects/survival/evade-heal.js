import { BaseEffect } from '../../base-effect.js';

export class EvadeHealEffect extends BaseEffect {
  apply(stats) {
    stats.evadeHealAmount = (stats.evadeHealAmount || 0) + this.value;
  }
}
