import { BaseEffect } from '../base-effect.js';

export class ArmorBoostEffect extends BaseEffect {
  apply(stats) {
    stats.armor += this.value;
  }
}
