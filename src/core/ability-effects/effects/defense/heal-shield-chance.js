import { BaseEffect } from '../../base-effect.js';

export class HealShieldChanceEffect extends BaseEffect {
  apply(stats) {
    stats.healShieldChance = (stats.healShieldChance || 0) + (this.value / 100);
  }
}
