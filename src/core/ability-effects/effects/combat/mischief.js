import { BaseEffect } from '../../base-effect.js';

export class MischiefEffect extends BaseEffect {
  apply(stats) {
    stats.mischief = (stats.mischief || 0) + (this.value / 100);
  }
}
