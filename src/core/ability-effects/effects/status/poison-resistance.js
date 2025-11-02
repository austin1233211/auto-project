import { BaseEffect } from '../../base-effect.js';

export class PoisonResistanceEffect extends BaseEffect {
  apply(stats) {
    stats.poisonResistance = (stats.poisonResistance || 0) + (this.value / 100);
  }
}
