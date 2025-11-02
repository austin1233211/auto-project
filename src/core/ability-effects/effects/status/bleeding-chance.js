import { BaseEffect } from '../../base-effect.js';

export class BleedingChanceEffect extends BaseEffect {
  apply(stats) {
    stats.bleedingChance = (stats.bleedingChance || 0) + (this.value / 100);
  }
}
