import { BaseEffect } from '../base-effect.js';

export class ArmorPierceChanceEffect extends BaseEffect {
  apply(stats) {
    stats.armorPierceChance = (stats.armorPierceChance || 0) + (this.value / 100);
  }
}
