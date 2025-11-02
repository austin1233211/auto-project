import { BaseEffect } from '../../base-effect.js';

export class OpponentCritResistEffect extends BaseEffect {
  apply(stats) {
    stats.opponentCritResist = (stats.opponentCritResist || 0) + (this.value / 100);
  }
}
