import { BaseEffect } from '../../base-effect.js';

export class ShieldLossDamageEffect extends BaseEffect {
  apply(stats) {
    stats.shieldLossDamage = (stats.shieldLossDamage || 0) + (this.value / 100);
  }
}
