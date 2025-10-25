import { BaseEffect } from '../base-effect.js';

export class HealthDeathImmunityEffect extends BaseEffect {
  apply(stats) {
    stats.healthDeathImmunity = (stats.healthDeathImmunity || 0) + (this.value / 100);
  }
}
