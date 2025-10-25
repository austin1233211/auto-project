import { BaseEffect } from '../base-effect.js';

export class HealFrostChanceEffect extends BaseEffect {
  apply(stats) {
    stats.healFrostChance = (stats.healFrostChance || 0) + (this.value / 100);
  }
}
