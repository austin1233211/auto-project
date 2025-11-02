import { BaseEffect } from '../../base-effect.js';

export class MagicAmpEffect extends BaseEffect {
  apply(stats) {
    stats.magicDamageAmplification = (stats.magicDamageAmplification || 0) + (this.value / 100);
  }
}
