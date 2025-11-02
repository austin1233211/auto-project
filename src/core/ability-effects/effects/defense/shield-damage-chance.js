import { BaseEffect } from '../../base-effect.js';

export class ShieldDamageChanceEffect extends BaseEffect {
  apply(stats) {
    stats.shieldDamageChance = (stats.shieldDamageChance || 0) + (this.value / 100);
  }
}
