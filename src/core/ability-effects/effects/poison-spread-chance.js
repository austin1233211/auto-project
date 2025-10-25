import { BaseEffect } from '../base-effect.js';

export class PoisonSpreadChanceEffect extends BaseEffect {
  apply(stats) {
    stats.poisonSpreadChance = (stats.poisonSpreadChance || 0) + (this.value / 100);
  }
}
