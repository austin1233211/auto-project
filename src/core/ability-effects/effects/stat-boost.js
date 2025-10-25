import { BaseEffect } from '../base-effect.js';

export class StatBoostEffect extends BaseEffect {
  apply(stats) {
    stats.attack += this.value;
    stats.health += this.value * 10;
    stats.speed += this.value;
    stats.armor += this.value;
  }
}
