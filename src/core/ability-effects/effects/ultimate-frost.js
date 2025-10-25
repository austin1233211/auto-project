import { BaseEffect } from '../base-effect.js';

export class UltimateFrostEffect extends BaseEffect {
  apply(stats) {
    stats.ultimateFrost = (stats.ultimateFrost || 0) + this.value;
  }
}
