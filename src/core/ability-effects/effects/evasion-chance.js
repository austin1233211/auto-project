import { BaseEffect } from '../base-effect.js';

export class EvasionChanceEffect extends BaseEffect {
  apply(stats) {
    stats.evasionChance = (stats.evasionChance || 0) + (this.value / 100);
  }
}
