import { BaseEffect } from '../base-effect.js';

export class DoubleAttackChanceEffect extends BaseEffect {
  apply(stats) {
    stats.doubleAttackChance = (stats.doubleAttackChance || 0) + (this.value / 100);
  }
}
