import { BaseEffect } from '../base-effect.js';

export class AttackDamageIncreaseEffect extends BaseEffect {
  apply(stats) {
    stats.attackDamageIncrease = (stats.attackDamageIncrease || 0) + (this.value / 100);
  }
}
