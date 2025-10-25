import { BaseEffect } from '../base-effect.js';

export class CritMultiplierEffect extends BaseEffect {
  apply(stats) {
    stats.critDamage = (stats.critDamage || 1.5) + (this.value / 100);
  }
}
