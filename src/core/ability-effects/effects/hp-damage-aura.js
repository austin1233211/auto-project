import { BaseEffect } from '../base-effect.js';

export class HpDamageAuraEffect extends BaseEffect {
  apply(stats) {
    stats.hpDamageAura = (stats.hpDamageAura || 0) + (this.value / 100);
  }
}
