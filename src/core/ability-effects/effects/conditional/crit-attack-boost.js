import { BaseEffect } from '../../base-effect.js';

export class CritAttackBoostEffect extends BaseEffect {
  apply(stats) {
    stats.critAttackBoost = (stats.critAttackBoost || 0) + this.value;
  }
}
