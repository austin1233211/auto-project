import { BaseEffect } from '../base-effect.js';

export class CritArmorPierceEffect extends BaseEffect {
  apply(stats) {
    stats.critArmorPierce = (stats.critArmorPierce || 0) + (this.value / 100);
  }
}
