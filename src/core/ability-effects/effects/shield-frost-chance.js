import { BaseEffect } from '../base-effect.js';

export class ShieldFrostChanceEffect extends BaseEffect {
  apply(stats) {
    stats.shieldFrostChance = (stats.shieldFrostChance || 0) + (this.value / 100);
  }
}
