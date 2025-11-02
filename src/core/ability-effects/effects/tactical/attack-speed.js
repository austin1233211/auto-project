import { BaseEffect } from '../../base-effect.js';

export class AttackSpeedEffect extends BaseEffect {
  apply(stats) {
    stats.attackSpeed = (stats.attackSpeed || 0) + (this.value / 100);
  }
}
