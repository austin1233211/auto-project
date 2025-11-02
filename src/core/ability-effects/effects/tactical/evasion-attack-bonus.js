import { BaseEffect } from '../../base-effect.js';

export class EvasionAttackBonusEffect extends BaseEffect {
  apply(stats) {
    stats.evasionAttackBonus = (stats.evasionAttackBonus || 0) + (this.value / 100);
  }
}
