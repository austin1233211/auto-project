import { BaseEffect } from '../base-effect.js';

export class EnhancedRegenEffect extends BaseEffect {
  apply(stats) {
    stats.enhancedRegen = (stats.enhancedRegen || 0) + this.value;
  }
}
