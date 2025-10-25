import { BaseEffect } from '../base-effect.js';

export class ShieldAuraEffect extends BaseEffect {
  apply(stats) {
    stats.shieldAura = (stats.shieldAura || 0) + this.value;
  }
}
