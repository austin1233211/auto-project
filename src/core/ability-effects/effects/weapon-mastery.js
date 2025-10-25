import { BaseEffect } from '../base-effect.js';

export class WeaponMasteryEffect extends BaseEffect {
  apply(stats) {
    stats.weaponMastery = (stats.weaponMastery || 0) + (this.value / 100);
  }
}
