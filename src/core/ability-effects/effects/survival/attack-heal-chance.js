import { BaseEffect } from '../../base-effect.js';

export class AttackHealChanceEffect extends BaseEffect {
  apply(stats) {
    stats.attackHealChance = (stats.attackHealChance || 0) + (this.value / 100);
  }
}
