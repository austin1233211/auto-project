import { BaseEffect } from '../base-effect.js';

export class IgnoreEvadeEffect extends BaseEffect {
  apply(stats) {
    stats.ignoreEvade = (stats.ignoreEvade || 0) + (this.value / 100);
  }
}
