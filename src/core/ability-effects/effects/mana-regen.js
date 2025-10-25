import { BaseEffect } from '../base-effect.js';

export class ManaRegenEffect extends BaseEffect {
  apply(stats) {
    stats.manaRegeneration = (stats.manaRegeneration || 0) + (this.value / 100);
  }
}
