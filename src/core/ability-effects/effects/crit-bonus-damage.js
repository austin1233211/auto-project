import { BaseEffect } from '../base-effect.js';

export class CritBonusDamageEffect extends BaseEffect {
  apply(stats) {
    stats.critBonusDamage = (stats.critBonusDamage || 0) + (this.value / 100);
  }
}
