import { BaseEffect } from '../base-effect.js';

export class MagicCritChanceEffect extends BaseEffect {
  apply(stats) {
    stats.magicCritChance = (stats.magicCritChance || 0) + (this.value / 100);
  }
}
