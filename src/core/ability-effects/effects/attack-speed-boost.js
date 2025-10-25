import { BaseEffect } from '../base-effect.js';

export class AttackSpeedBoostEffect extends BaseEffect {
  apply(stats) {
    stats.attackSpeedBoost = (stats.attackSpeedBoost || 0) + (this.value / 100);
  }
}
