import { BaseEffect } from '../../base-effect.js';

export class HealthBoostFlatEffect extends BaseEffect {
  apply(stats) {
    stats.health += this.value;
  }
}
