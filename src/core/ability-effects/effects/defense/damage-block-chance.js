import { BaseEffect } from '../../base-effect.js';

export class DamageBlockChanceEffect extends BaseEffect {
  apply(stats) {
    stats.damageBlockChance = (stats.damageBlockChance || 0) + (this.value / 100);
  }
}
