import { BaseEffect } from '../../base-effect.js';

export class RelentlessStrikeEffect extends BaseEffect {
  apply(stats) {
    stats.relentlessStrike = (stats.relentlessStrike || 0) + (this.value / 100);
  }
}
