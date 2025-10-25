import { BaseEffect } from '../base-effect.js';

export class FrostNovaDamageEffect extends BaseEffect {
  apply(stats) {
    stats.frostNovaDamage = (stats.frostNovaDamage || 0) + this.value;
  }
}
