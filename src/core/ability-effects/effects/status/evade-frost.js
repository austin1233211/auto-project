import { BaseEffect } from '../../base-effect.js';

export class EvadeFrostEffect extends BaseEffect {
  apply(stats) {
    stats.evadeFrostStacks = (stats.evadeFrostStacks || 0) + this.value;
  }
}
