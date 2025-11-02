import { BaseEffect } from '../../base-effect.js';

export class KillAttackBoostEffect extends BaseEffect {
  apply(stats) {
    stats.killAttackBoost = (stats.killAttackBoost || 0) + this.value;
  }
}
