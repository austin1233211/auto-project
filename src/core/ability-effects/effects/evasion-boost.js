import { BaseEffect } from '../base-effect.js';

export class EvasionBoostEffect extends BaseEffect {
  apply(stats) {
    stats.evasionChance = (stats.evasionChance || 0) + (this.value / 100);
  }
}
