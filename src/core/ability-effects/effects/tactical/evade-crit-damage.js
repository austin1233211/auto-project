import { BaseEffect } from '../../base-effect.js';

export class EvadeCritDamageEffect extends BaseEffect {
  apply(stats) {
    stats.evadeCritDamage = (stats.evadeCritDamage || 0) + (this.value / 100);
  }
}
