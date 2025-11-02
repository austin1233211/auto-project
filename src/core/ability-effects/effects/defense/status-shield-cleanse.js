import { BaseEffect } from '../../base-effect.js';

export class StatusShieldCleanseEffect extends BaseEffect {
  apply(stats) {
    stats.statusShieldCleanse = (stats.statusShieldCleanse || 0) + (this.value / 100);
  }
}
