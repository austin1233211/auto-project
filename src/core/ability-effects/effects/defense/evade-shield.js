import { BaseEffect } from '../../base-effect.js';

export class EvadeShieldEffect extends BaseEffect {
  apply(stats) {
    stats.evadeShieldStacks = (stats.evadeShieldStacks || 0) + this.value;
  }
}
