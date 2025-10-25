import { BaseEffect } from '../base-effect.js';

export class ShieldReflectChanceEffect extends BaseEffect {
  apply(stats) {
    stats.shieldReflectChance = (stats.shieldReflectChance || 0) + (this.value / 100);
  }
}
