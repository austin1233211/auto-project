import { BaseEffect } from '../../base-effect.js';

export class BattleStartShieldEffect extends BaseEffect {
  apply(stats) {
    stats.battleStartShield = (stats.battleStartShield || 0) + this.value;
  }
}
