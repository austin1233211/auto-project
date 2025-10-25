import { BaseEffect } from '../base-effect.js';

export class PoisonDecayResistEffect extends BaseEffect {
  apply(stats) {
    stats.poisonDecayResist = (stats.poisonDecayResist || 0) + (this.value / 100);
  }
}
