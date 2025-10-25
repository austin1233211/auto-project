import { BaseEffect } from '../base-effect.js';

export class OpponentHealthReductionEffect extends BaseEffect {
  apply(stats) {
    stats.opponentHealthReduction = (stats.opponentHealthReduction || 0) + (this.value / 100);
  }
}
