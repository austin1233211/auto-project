import { BaseEffect } from '../../base-effect.js';

export class AttackBoostEffect extends BaseEffect {
  apply(stats) {
    stats.attack += this.value;
  }
}
