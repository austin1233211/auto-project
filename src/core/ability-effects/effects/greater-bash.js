import { BaseEffect } from '../base-effect.js';

export class GreaterBashEffect extends BaseEffect {
  apply(stats) {
    stats.greaterBash = (stats.greaterBash || 0) + this.value;
  }
}
