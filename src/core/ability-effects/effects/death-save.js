import { BaseEffect } from '../base-effect.js';

export class DeathSaveEffect extends BaseEffect {
  apply(stats) {
    stats.deathSaveCharges = (stats.deathSaveCharges || 0) + this.value;
  }
}
