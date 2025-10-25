import { BaseEffect } from '../base-effect.js';

export class CritIgnoreShieldEffect extends BaseEffect {
  apply(stats) {
    stats.critIgnoreShield = (stats.critIgnoreShield || 0) + (this.value / 100);
  }
}
