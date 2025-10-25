import { BaseEffect } from '../base-effect.js';

export class CounterChanceEffect extends BaseEffect {
  apply(stats) {
    stats.counterChance = (stats.counterChance || 0) + (this.value / 100);
  }
}
