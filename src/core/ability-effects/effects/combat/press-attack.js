import { BaseEffect } from '../../base-effect.js';

export class PressAttackEffect extends BaseEffect {
  apply(stats) {
    stats.pressAttack = (stats.pressAttack || 0) + (this.value / 100);
  }
}
