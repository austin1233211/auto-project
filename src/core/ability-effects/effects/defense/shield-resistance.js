import { BaseEffect } from '../../base-effect.js';

export class ShieldResistanceEffect extends BaseEffect {
  apply(stats) {
    stats.shieldResistance = (stats.shieldResistance || 0) + (this.value / 100);
  }
}
