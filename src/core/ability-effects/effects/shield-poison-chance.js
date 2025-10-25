import { BaseEffect } from '../base-effect.js';

export class ShieldPoisonChanceEffect extends BaseEffect {
  apply(stats) {
    stats.shieldPoisonChance = (stats.shieldPoisonChance || 0) + (this.value / 100);
  }
}
