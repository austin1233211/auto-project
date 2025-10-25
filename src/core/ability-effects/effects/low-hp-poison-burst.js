import { BaseEffect } from '../base-effect.js';

export class LowHpPoisonBurstEffect extends BaseEffect {
  apply(stats) {
    stats.lowHpPoisonBurst = (stats.lowHpPoisonBurst || 0) + this.value;
  }
}
