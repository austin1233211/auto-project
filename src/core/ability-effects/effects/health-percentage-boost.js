import { BaseEffect } from '../base-effect.js';

export class HealthPercentageBoostEffect extends BaseEffect {
  apply(stats) {
    stats.health *= (1 + this.value / 100);
  }
}
