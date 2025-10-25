import { BaseEffect } from '../base-effect.js';

export class MagicResistEffect extends BaseEffect {
  apply(stats) {
    stats.magicDamageReduction = (stats.magicDamageReduction || 0) + (this.value / 100);
  }
}
