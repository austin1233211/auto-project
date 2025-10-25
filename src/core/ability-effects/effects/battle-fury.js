import { BaseEffect } from '../base-effect.js';

export class BattleFuryEffect extends BaseEffect {
  apply(stats) {
    stats.battleFury = (stats.battleFury || 0) + (this.value / 100);
  }
}
