import { BaseEffect } from '../../base-effect.js';

export class HealthRegenPercentEffect extends BaseEffect {
  apply(stats) {
    stats.healthRegenPercent = (stats.healthRegenPercent || 0) + (this.value / 100);
  }
}
