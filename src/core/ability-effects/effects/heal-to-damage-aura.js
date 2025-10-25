import { BaseEffect } from '../base-effect.js';

export class HealToDamageAuraEffect extends BaseEffect {
  apply(stats) {
    stats.healToDamageAura = (stats.healToDamageAura || 0) + (this.value / 100);
  }
}
