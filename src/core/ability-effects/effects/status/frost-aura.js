import { BaseEffect } from '../../base-effect.js';

export class FrostAuraEffect extends BaseEffect {
  apply(stats) {
    stats.frostAura = (stats.frostAura || 0) + this.value;
  }
}
