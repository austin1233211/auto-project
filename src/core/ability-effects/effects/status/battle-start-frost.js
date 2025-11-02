import { BaseEffect } from '../../base-effect.js';

export class BattleStartFrostEffect extends BaseEffect {
  apply(stats) {
    stats.battleStartFrost = (stats.battleStartFrost || 0) + this.value;
  }
}
