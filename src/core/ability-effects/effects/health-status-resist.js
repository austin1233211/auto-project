import { BaseEffect } from '../base-effect.js';

export class HealthStatusResistEffect extends BaseEffect {
  apply(stats) {
    stats.healthStatusResist = (stats.healthStatusResist || 0) + (this.value / 100);
  }
}
