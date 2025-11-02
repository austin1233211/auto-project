import { BaseEffect } from '../../base-effect.js';

export class EvadeCritBoostEffect extends BaseEffect {
  apply(stats) {
    stats.evadeCritBoost = (stats.evadeCritBoost || 0) + (this.value / 100);
  }
}
