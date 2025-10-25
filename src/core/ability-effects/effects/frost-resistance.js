import { BaseEffect } from '../base-effect.js';

export class FrostResistanceEffect extends BaseEffect {
  apply(stats) {
    stats.frostResistance = (stats.frostResistance || 0) + (this.value / 100);
  }
}
