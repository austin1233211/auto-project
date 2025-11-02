import { BaseEffect } from '../../base-effect.js';

export class PoisonStatusImmunityEffect extends BaseEffect {
  apply(stats) {
    stats.poisonStatusImmunity = (stats.poisonStatusImmunity || 0) + (this.value / 100);
  }
}
