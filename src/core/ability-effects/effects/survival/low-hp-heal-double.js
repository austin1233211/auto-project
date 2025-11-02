import { BaseEffect } from '../../base-effect.js';

export class LowHpHealDoubleEffect extends BaseEffect {
  apply(stats) {
    stats.lowHpHealDouble = (stats.lowHpHealDouble || 0) + (this.value / 100);
  }
}
