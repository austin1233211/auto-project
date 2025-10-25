import { BaseEffect } from '../base-effect.js';

export class ConsecutiveAttackBoostEffect extends BaseEffect {
  apply(stats) {
    stats.consecutiveAttackBoost = (stats.consecutiveAttackBoost || 0) + (this.value / 100);
  }
}
