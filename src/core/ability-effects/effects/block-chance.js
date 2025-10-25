import { BaseEffect } from '../base-effect.js';

export class BlockChanceEffect extends BaseEffect {
  apply(stats) {
    stats.blockChance = (stats.blockChance || 0) + (this.value / 100);
  }
}
