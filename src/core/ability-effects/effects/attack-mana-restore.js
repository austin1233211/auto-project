import { BaseEffect } from '../base-effect.js';

export class AttackManaRestoreEffect extends BaseEffect {
  apply(stats) {
    stats.attackManaRestore = (stats.attackManaRestore || 0) + (this.value / 100);
  }
}
