import { BaseEffect } from '../../base-effect.js';

export class HealthSectReductionEffect extends BaseEffect {
  apply(stats) {
    stats.healthSectReduction = (stats.healthSectReduction || 0) + (this.value / 100);
  }
}
