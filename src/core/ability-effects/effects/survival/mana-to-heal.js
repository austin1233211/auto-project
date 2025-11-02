import { BaseEffect } from '../../base-effect.js';

export class ManaToHealEffect extends BaseEffect {
  apply(stats) {
    stats.manaToHeal = (stats.manaToHeal || 0) + (this.value / 100);
  }
}
