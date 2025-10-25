import { BaseEffect } from '../base-effect.js';

export class LowHealthLifestealEffect extends BaseEffect {
  apply(stats) {
    stats.lowHealthLifesteal = (stats.lowHealthLifesteal || 0) + (this.value / 100);
  }
}
