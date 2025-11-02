import { BaseEffect } from '../../base-effect.js';

export class HealthOnCritEffect extends BaseEffect {
  apply(stats) {
    stats.healthOnCrit = (stats.healthOnCrit || 0) + this.value;
  }
}
