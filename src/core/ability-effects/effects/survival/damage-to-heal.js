import { BaseEffect } from '../../base-effect.js';

export class DamageToHealEffect extends BaseEffect {
  apply(stats) {
    stats.damageToHeal = (stats.damageToHeal || 0) + (this.value / 100);
  }
}
