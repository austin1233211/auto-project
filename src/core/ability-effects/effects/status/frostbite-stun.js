import { BaseEffect } from '../../base-effect.js';

export class FrostbiteStunEffect extends BaseEffect {
  apply(stats) {
    stats.frostbiteStun = (stats.frostbiteStun || 0) + this.value;
  }
}
