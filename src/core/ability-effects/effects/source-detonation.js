import { BaseEffect } from '../base-effect.js';

export class SourceDetonationEffect extends BaseEffect {
  apply(stats) {
    stats.sourceDetonation = (stats.sourceDetonation || 0) + (this.value / 100);
  }
}
