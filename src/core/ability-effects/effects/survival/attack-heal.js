import { BaseEffect } from '../../base-effect.js';

export class AttackHealEffect extends BaseEffect {
  apply(stats) {
    stats.attackHealAmount = (stats.attackHealAmount || 0) + this.value;
  }
}
