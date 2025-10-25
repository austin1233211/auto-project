import { BaseEffect } from '../base-effect.js';

export class FrostManaBoostEffect extends BaseEffect {
  apply(stats) {
    stats.frostManaBoost = (stats.frostManaBoost || 0) + this.value;
  }
}
