import { BaseEffect } from '../base-effect.js';

export class CritPoisonEffect extends BaseEffect {
  apply(stats) {
    stats.critPoisonStacks = (stats.critPoisonStacks || 0) + this.value;
  }
}
