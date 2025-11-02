import { BaseEffect } from '../../base-effect.js';

export class PhysicalAmpEffect extends BaseEffect {
  apply(stats) {
    stats.physicalDamageAmplification = (stats.physicalDamageAmplification || 0) + (this.value / 100);
  }
}
