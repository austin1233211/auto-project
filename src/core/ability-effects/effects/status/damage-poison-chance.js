import { BaseEffect } from '../../base-effect.js';

export class DamagePoisonChanceEffect extends BaseEffect {
  apply(stats) {
    stats.damagePoisonChance = (stats.damagePoisonChance || 0) + (this.value / 100);
  }
}
