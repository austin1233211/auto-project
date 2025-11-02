import { BaseEffect } from '../../base-effect.js';

export class FrostSlowAuraEffect extends BaseEffect {
  apply(stats) {
    stats.frostSlowAura = (stats.frostSlowAura || 0) + (this.value / 100);
  }
}
