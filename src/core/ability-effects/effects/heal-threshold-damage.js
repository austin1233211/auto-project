import { BaseEffect } from '../base-effect.js';

export class HealThresholdDamageEffect extends BaseEffect {
  apply(stats) {
    stats.healThresholdDamage = (stats.healThresholdDamage || 0) + this.value;
  }
}
