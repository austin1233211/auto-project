import { BaseEffect } from '../base-effect.js';

export class AbilityCooldownEffect extends BaseEffect {
  apply(stats) {
    stats.abilityCooldownReduction = (stats.abilityCooldownReduction || 0) + (this.value / 100);
  }
}
