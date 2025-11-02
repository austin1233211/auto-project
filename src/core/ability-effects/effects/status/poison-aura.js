import { BaseEffect } from '../../base-effect.js';

export class PoisonAuraEffect extends BaseEffect {
  apply(stats) {
    stats.poisonAura = (stats.poisonAura || 0) + this.value;
  }
}
