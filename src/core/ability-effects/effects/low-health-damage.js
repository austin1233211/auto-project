import { BaseEffect } from '../base-effect.js';

export class LowHealthDamageEffect extends BaseEffect {
  apply(stats) {
    stats.lowHealthDamageBonus = (stats.lowHealthDamageBonus || 0) + (this.value / 100);
  }
}
