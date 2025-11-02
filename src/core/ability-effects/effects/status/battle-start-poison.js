import { BaseEffect } from '../../base-effect.js';

export class BattleStartPoisonEffect extends BaseEffect {
  apply(stats) {
    stats.battleStartPoison = (stats.battleStartPoison || 0) + this.value;
  }
}
