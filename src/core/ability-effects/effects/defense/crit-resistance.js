import { BaseEffect } from '../../base-effect.js';

export class CritResistanceEffect extends BaseEffect {
  apply(stats) {
    stats.critResistance = (stats.critResistance || 0) + (this.value / 100);
  }
}
