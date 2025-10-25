import { BaseEffect } from '../base-effect.js';

export class AttackSpeedIncreaseEffect extends BaseEffect {
  apply(stats) {
    stats.attackSpeedIncrease = (stats.attackSpeedIncrease || 0) + this.value;
  }
}
