import { BaseEffect } from '../../base-effect.js';

export class AttackPoisonEffect extends BaseEffect {
  apply(stats) {
    stats.attackPoisonStacks = (stats.attackPoisonStacks || 0) + this.value;
  }
}
