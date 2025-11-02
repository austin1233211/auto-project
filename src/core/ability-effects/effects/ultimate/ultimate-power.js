import { BaseEffect } from '../../base-effect.js';

export class UltimatePowerEffect extends BaseEffect {
  apply(stats) {
    const ultimateBonus = this.value / 100;
    stats.attack *= (1 + ultimateBonus);
    stats.health *= (1 + ultimateBonus);
    stats.speed *= (1 + ultimateBonus);
    stats.armor *= (1 + ultimateBonus);
  }
}
