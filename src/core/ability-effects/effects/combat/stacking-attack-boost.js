import { BaseEffect } from '../../base-effect.js';

export class StackingAttackBoostEffect extends BaseEffect {
  apply(stats) {
    stats.stackingAttackBoost = (stats.stackingAttackBoost || 0) + (this.value / 100);
  }
}
