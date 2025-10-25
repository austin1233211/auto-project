import { BaseEffect } from '../base-effect.js';

export class SpeedBoostEffect extends BaseEffect {
  apply(stats) {
    stats.speed += this.value;
  }
}
