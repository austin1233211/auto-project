import { BaseEffect } from '../../base-effect.js';

export class CrushingBlowEffect extends BaseEffect {
  apply(stats) {
    stats.crushingBlow = (stats.crushingBlow || 0) + (this.value / 100);
  }
}
