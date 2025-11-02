import { BaseEffect } from '../../base-effect.js';

export class HealthBoostEffect extends BaseEffect {
  apply(stats) {
    stats.health += this.value;
  }
}
