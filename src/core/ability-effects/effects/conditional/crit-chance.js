import { BaseEffect } from '../../base-effect.js';

export class CritChanceEffect extends BaseEffect {
  apply(stats) {
    stats.critChance = (stats.critChance || 0) + (this.value / 100);
  }
}
