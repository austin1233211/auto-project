import { BaseEffect } from '../base-effect.js';

export class ShieldEffectivenessEffect extends BaseEffect {
  apply(stats) {
    stats.shieldEffectiveness = (stats.shieldEffectiveness || 0) + (this.value / 100);
  }
}
