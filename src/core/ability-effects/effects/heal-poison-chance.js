import { BaseEffect } from '../base-effect.js';

export class HealPoisonChanceEffect extends BaseEffect {
  apply(stats) {
    stats.healPoisonChance = (stats.healPoisonChance || 0) + (this.value / 100);
  }
}
