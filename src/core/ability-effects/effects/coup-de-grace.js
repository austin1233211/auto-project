import { BaseEffect } from '../base-effect.js';

export class CoupDeGraceEffect extends BaseEffect {
  apply(stats) {
    stats.coupDeGrace = (stats.coupDeGrace || 0) + (this.value / 100);
  }
}
