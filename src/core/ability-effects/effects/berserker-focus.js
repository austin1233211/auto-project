import { BaseEffect } from '../base-effect.js';

export class BerserkerFocusEffect extends BaseEffect {
  apply(stats) {
    stats.berserkerFocus = (stats.berserkerFocus || 0) + this.value;
  }
}
