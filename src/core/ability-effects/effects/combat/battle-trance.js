import { BaseEffect } from '../../base-effect.js';

export class BattleTranceEffect extends BaseEffect {
  apply(stats) {
    stats.battleTrance = (stats.battleTrance || 0) + (this.value / 100);
  }
}
