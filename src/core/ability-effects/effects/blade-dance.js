import { BaseEffect } from '../base-effect.js';

export class BladeDanceEffect extends BaseEffect {
  apply(stats) {
    stats.bladeDance = (stats.bladeDance || 0) + (this.value / 100);
  }
}
