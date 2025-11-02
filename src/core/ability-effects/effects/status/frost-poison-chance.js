import { BaseEffect } from '../../base-effect.js';

export class FrostPoisonChanceEffect extends BaseEffect {
  apply(stats) {
    stats.frostPoisonChance = (stats.frostPoisonChance || 0) + (this.value / 100);
  }
}
