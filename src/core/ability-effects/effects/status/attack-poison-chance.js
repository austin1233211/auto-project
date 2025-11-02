import { BaseEffect } from '../../base-effect.js';

export class AttackPoisonChanceEffect extends BaseEffect {
  apply(stats) {
    stats.attackPoisonChance = (stats.attackPoisonChance || 0) + (this.value / 100);
  }
}
