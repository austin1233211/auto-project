import { BaseEffect } from '../base-effect.js';

export class FrostStackBonusEffect extends BaseEffect {
  apply(stats) {
    stats.frostStackBonus = (stats.frostStackBonus || 0) + this.value;
  }
}
