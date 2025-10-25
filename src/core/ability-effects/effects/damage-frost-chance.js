import { BaseEffect } from '../base-effect.js';

export class DamageFrostChanceEffect extends BaseEffect {
  apply(stats) {
    stats.damageFrostChance = (stats.damageFrostChance || 0) + (this.value / 100);
  }
}
