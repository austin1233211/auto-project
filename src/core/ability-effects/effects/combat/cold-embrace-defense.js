import { BaseEffect } from '../../base-effect.js';

export class ColdEmbraceDefenseEffect extends BaseEffect {
  apply(stats) {
    stats.coldEmbraceDefense = (stats.coldEmbraceDefense || 0) + (this.value / 100);
  }
}
