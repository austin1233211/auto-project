import { BaseEffect } from '../base-effect.js';

export class LowHealthRegenEffect extends BaseEffect {
  apply(stats) {
    stats.lowHealthRegen = (stats.lowHealthRegen || 0) + this.value;
  }
}
