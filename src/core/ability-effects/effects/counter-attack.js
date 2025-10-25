import { BaseEffect } from '../base-effect.js';

export class CounterAttackEffect extends BaseEffect {
  apply(stats) {
    stats.counterAttack = (stats.counterAttack || 0) + (this.value / 100);
  }
}
