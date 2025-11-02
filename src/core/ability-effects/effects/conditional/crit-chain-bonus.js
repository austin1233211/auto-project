import { BaseEffect } from '../../base-effect.js';

export class CritChainBonusEffect extends BaseEffect {
  apply(stats) {
    stats.critChainBonus = (stats.critChainBonus || 0) + (this.value / 100);
  }
}
