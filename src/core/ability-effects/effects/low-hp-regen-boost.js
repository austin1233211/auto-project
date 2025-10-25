import { BaseEffect } from '../base-effect.js';

export class LowHpRegenBoostEffect extends BaseEffect {
  apply(stats) {
    stats.lowHpRegenBoost = (stats.lowHpRegenBoost || 0) + (this.value / 100);
  }
}
