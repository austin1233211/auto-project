import { BaseEffect } from '../base-effect.js';

export class UltimateShieldEffect extends BaseEffect {
  apply(stats) {
    stats.ultimateShield = (stats.ultimateShield || 0) + this.value;
  }
}
