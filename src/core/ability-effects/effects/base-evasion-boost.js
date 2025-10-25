import { BaseEffect } from '../base-effect.js';

export class BaseEvasionBoostEffect extends BaseEffect {
  apply(stats) {
    stats.evasionChance = (stats.evasionChance || 0) + (this.value / 100);
  }
}
