import { BaseEffect } from '../../base-effect.js';

export class MagicEvasionEffect extends BaseEffect {
  apply(stats) {
    stats.magicEvasion = (stats.magicEvasion || 0) + (this.value / 100);
  }
}
