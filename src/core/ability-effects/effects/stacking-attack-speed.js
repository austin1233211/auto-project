import { BaseEffect } from '../base-effect.js';

export class StackingAttackSpeedEffect extends BaseEffect {
  apply(stats) {
    stats.stackingAttackSpeed = (stats.stackingAttackSpeed || 0) + this.value;
  }
}
