import { BaseEffect } from '../base-effect.js';

export class HealthOnKillEffect extends BaseEffect {
  apply(stats) {
    stats.healthOnKill = (stats.healthOnKill || 0) + this.value;
  }
}
