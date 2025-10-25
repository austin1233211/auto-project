import { BaseEffect } from '../base-effect.js';

export class CritHpBoostEffect extends BaseEffect {
  apply(stats) {
    stats.critHpBoost = (stats.critHpBoost || 0) + this.value;
  }
}
