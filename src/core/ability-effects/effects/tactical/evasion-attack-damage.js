import { BaseEffect } from '../../base-effect.js';

export class EvasionAttackDamageEffect extends BaseEffect {
  apply(stats) {
    stats.evasionAttackDamage = (stats.evasionAttackDamage || 0) + (this.value / 100);
  }
}
