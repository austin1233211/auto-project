import { BaseEffect } from '../base-effect.js';

export class HighDamageShieldEffect extends BaseEffect {
  apply(stats) {
    stats.highDamageShield = (stats.highDamageShield || 0) + this.value;
  }
}
