import { BaseEffect } from '../../base-effect.js';

export class HealDamageChanceEffect extends BaseEffect {
  apply(stats) {
    stats.healDamageChance = (stats.healDamageChance || 0) + (this.value / 100);
  }
}
