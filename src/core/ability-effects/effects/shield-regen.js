import { BaseEffect } from '../base-effect.js';

export class ShieldRegenEffect extends BaseEffect {
  apply(stats) {
    stats.shieldRegen = (stats.shieldRegen || 0) + this.value;
  }
}
