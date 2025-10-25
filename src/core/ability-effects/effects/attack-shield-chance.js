import { BaseEffect } from '../base-effect.js';

export class AttackShieldChanceEffect extends BaseEffect {
  apply(stats) {
    stats.attackShieldChance = (stats.attackShieldChance || 0) + (this.value / 100);
  }
}
