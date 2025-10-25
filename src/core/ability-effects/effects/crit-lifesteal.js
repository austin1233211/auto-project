import { BaseEffect } from '../base-effect.js';

export class CritLifestealEffect extends BaseEffect {
  apply(stats) {
    stats.critLifesteal = (stats.critLifesteal || 0) + (this.value / 100);
  }
}
