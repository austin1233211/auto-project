import { BaseEffect } from '../base-effect.js';

export class CritShieldEffect extends BaseEffect {
  apply(stats) {
    stats.critShieldStacks = (stats.critShieldStacks || 0) + this.value;
  }
}
