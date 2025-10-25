import { BaseEffect } from '../base-effect.js';

export class UnyieldingSpiritEffect extends BaseEffect {
  apply(stats) {
    stats.unyieldingSpirit = (stats.unyieldingSpirit || 0) + (this.value / 100);
  }
}
