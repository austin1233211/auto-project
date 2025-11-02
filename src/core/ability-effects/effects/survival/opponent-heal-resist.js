import { BaseEffect } from '../../base-effect.js';

export class OpponentHealResistEffect extends BaseEffect {
  apply(stats) {
    stats.opponentHealResist = (stats.opponentHealResist || 0) + (this.value / 100);
  }
}
