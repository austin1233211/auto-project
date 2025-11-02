import { BaseEffect } from '../../base-effect.js';

export class BloodStrikeEffect extends BaseEffect {
  apply(stats) {
    stats.bloodStrike = (stats.bloodStrike || 0) + (this.value / 100);
  }
}
