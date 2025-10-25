import { BaseEffect } from '../base-effect.js';

export class CritGoldBonusEffect extends BaseEffect {
  apply(stats) {
    stats.critGoldBonus = (stats.critGoldBonus || 0) + this.value;
  }
}
