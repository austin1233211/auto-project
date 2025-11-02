import { BaseEffect } from '../../base-effect.js';

export class BaseDamageBoostEffect extends BaseEffect {
  apply(stats) {
    stats.attack += this.value;
  }
}
