import { BaseEffect } from '../base-effect.js';

export class DamageCounterEffect extends BaseEffect {
  apply(stats) {
    stats.damageCounterChance = (stats.damageCounterChance || 0) + (this.value / 100);
  }
}
