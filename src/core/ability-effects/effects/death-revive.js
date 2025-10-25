import { BaseEffect } from '../base-effect.js';

export class DeathReviveEffect extends BaseEffect {
  apply(stats) {
    stats.deathReviveHealth = (stats.deathReviveHealth || 0) + (this.value / 100);
  }
}
