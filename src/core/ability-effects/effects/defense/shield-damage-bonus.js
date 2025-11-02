import { BaseEffect } from '../../base-effect.js';

export class ShieldDamageBonusEffect extends BaseEffect {
  apply(stats) {
    stats.shieldDamageBonus = (stats.shieldDamageBonus || 0) + (this.value / 100);
  }
}
