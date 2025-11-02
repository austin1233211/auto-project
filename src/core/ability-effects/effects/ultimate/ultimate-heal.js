import { BaseEffect } from '../../base-effect.js';

export class UltimateHealEffect extends BaseEffect {
  apply(stats) {
    stats.ultimateHeal = (stats.ultimateHeal || 0) + this.value;
  }
}
