import { BaseEffect } from '../base-effect.js';

export class HealToAttackBoostEffect extends BaseEffect {
  apply(stats) {
    stats.healToAttackBoost = (stats.healToAttackBoost || 0) + (this.value / 100);
  }
}
