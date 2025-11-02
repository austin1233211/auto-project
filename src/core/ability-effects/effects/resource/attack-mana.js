import { BaseEffect } from '../../base-effect.js';

export class AttackManaEffect extends BaseEffect {
  apply(stats) {
    stats.attackManaAmount = (stats.attackManaAmount || 0) + this.value;
  }
}
