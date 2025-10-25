import { BaseEffect } from '../base-effect.js';

export class AttackFrostEffect extends BaseEffect {
  apply(stats) {
    stats.attackFrostStacks = (stats.attackFrostStacks || 0) + this.value;
  }
}
