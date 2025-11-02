import { BaseEffect } from '../../base-effect.js';

export class DispersionEffect extends BaseEffect {
  apply(stats) {
    stats.dispersion = (stats.dispersion || 0) + (this.value / 100);
  }
}
