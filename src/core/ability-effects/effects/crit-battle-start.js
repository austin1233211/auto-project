import { BaseEffect } from '../base-effect.js';

export class CritBattleStartEffect extends BaseEffect {
  apply(stats) {
    stats.critBattleStart = (stats.critBattleStart || 0) + this.value;
  }
}
