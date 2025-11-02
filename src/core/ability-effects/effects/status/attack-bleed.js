import { BaseEffect } from '../../base-effect.js';

export class AttackBleedEffect extends BaseEffect {
  apply(stats) {
    stats.attackBleedChance = (stats.attackBleedChance || 0) + (this.value / 100);
  }
}
