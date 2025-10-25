import { BaseEffect } from '../base-effect.js';

export class HealthRegenFlatEffect extends BaseEffect {
  apply(stats) {
    stats.healthRegenFlat = (stats.healthRegenFlat || 0) + this.value;
  }
}
