import { BaseEffect } from '../../base-effect.js';

export class FrostDamageChanceEffect extends BaseEffect {
  apply(stats) {
    stats.frostDamageChance = (stats.frostDamageChance || 0) + (this.value / 100);
  }
}
