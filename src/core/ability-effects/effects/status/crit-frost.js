import { BaseEffect } from '../../base-effect.js';

export class CritFrostEffect extends BaseEffect {
  apply(stats) {
    stats.critFrostStacks = (stats.critFrostStacks || 0) + this.value;
  }
}
