import { BaseEffect } from '../../base-effect.js';

export class EvadeCounterEffect extends BaseEffect {
  apply(stats) {
    stats.evadeCounter = (stats.evadeCounter || 0) + (this.value / 100);
  }
}
