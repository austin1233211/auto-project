import { BaseEffect } from '../../base-effect.js';

export class GoldBonusEffect extends BaseEffect {
  apply(stats) {
    stats.goldBonus = (stats.goldBonus || 0) + (this.value / 100);
  }
}
