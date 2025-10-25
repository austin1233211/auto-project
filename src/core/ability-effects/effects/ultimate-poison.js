import { BaseEffect } from '../base-effect.js';

export class UltimatePoisonEffect extends BaseEffect {
  apply(stats) {
    stats.ultimatePoison = (stats.ultimatePoison || 0) + this.value;
  }
}
