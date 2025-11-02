import { BaseEffect } from '../../base-effect.js';

export class LifeBreakEffect extends BaseEffect {
  apply(stats) {
    stats.lifeBreak = (stats.lifeBreak || 0) + (this.value / 100);
  }
}
