import { BaseEffect } from '../base-effect.js';

export class CritPoisonChanceEffect extends BaseEffect {
  apply(stats) {
    stats.critPoisonChance = (stats.critPoisonChance || 0) + (this.value / 100);
  }
}
