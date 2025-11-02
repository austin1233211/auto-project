import { BaseEffect } from '../../base-effect.js';

export class DealDamagePoisonChanceEffect extends BaseEffect {
  apply(stats) {
    stats.dealDamagePoisonChance = (stats.dealDamagePoisonChance || 0) + (this.value / 100);
  }
}
