import { BaseEffect } from '../../base-effect.js';

export class IgnoreEnemyEvadeEffect extends BaseEffect {
  apply(stats) {
    stats.ignoreEnemyEvade = (stats.ignoreEnemyEvade || 0) + (this.value / 100);
  }
}
