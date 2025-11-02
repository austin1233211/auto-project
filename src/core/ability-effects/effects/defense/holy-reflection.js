import { BaseEffect } from '../../base-effect.js';

export class HolyReflectionEffect extends BaseEffect {
  apply(stats) {
    stats.holyReflection = (stats.holyReflection || 0) + (this.value / 100);
  }
}
