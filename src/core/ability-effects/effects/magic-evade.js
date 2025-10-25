import { BaseEffect } from '../base-effect.js';

export class MagicEvadeEffect extends BaseEffect {
  apply(stats) {
    stats.magicEvade = (stats.magicEvade || 0) + (this.value / 100);
  }
}
