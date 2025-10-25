import { BaseEffect } from '../base-effect.js';

export class AuraHealNearbyEffect extends BaseEffect {
  apply(stats) {
    stats.auraHealNearby = (stats.auraHealNearby || 0) + this.value;
  }
}
