import { BaseEffect } from '../base-effect.js';

export class CritTempHpEffect extends BaseEffect {
  apply(stats) {
    stats.critTempHp = (stats.critTempHp || 0) + this.value;
  }
}
