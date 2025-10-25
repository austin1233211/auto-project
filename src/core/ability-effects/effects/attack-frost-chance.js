import { BaseEffect } from '../base-effect.js';

export class AttackFrostChanceEffect extends BaseEffect {
  apply(stats) {
    stats.attackFrostChance = (stats.attackFrostChance || 0) + (this.value / 100);
  }
}
