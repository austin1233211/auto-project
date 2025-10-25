import { BaseEffect } from '../base-effect.js';

export class AttackShieldEffect extends BaseEffect {
  apply(stats) {
    stats.attackShieldStacks = (stats.attackShieldStacks || 0) + this.value;
  }
}
