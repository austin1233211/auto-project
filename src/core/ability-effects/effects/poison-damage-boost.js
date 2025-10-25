import { BaseEffect } from '../base-effect.js';

export class PoisonDamageBoostEffect extends BaseEffect {
  apply(stats) {
    stats.poisonDamageBoost = (stats.poisonDamageBoost || 0) + (this.value / 100);
  }
}
