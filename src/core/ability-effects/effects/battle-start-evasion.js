import { BaseEffect } from '../base-effect.js';

export class BattleStartEvasionEffect extends BaseEffect {
  apply(stats) {
    stats.battleStartEvasion = (stats.battleStartEvasion || 0) + this.value;
  }
}
