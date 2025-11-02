import { BaseEffect } from '../../base-effect.js';

export class EvadePoisonEffect extends BaseEffect {
  apply(stats) {
    stats.evadePoisonStacks = (stats.evadePoisonStacks || 0) + this.value;
  }
}
