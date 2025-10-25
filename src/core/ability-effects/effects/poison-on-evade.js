import { BaseEffect } from '../base-effect.js';

export class PoisonOnEvadeEffect extends BaseEffect {
  apply(stats) {
    stats.poisonOnEvade = (stats.poisonOnEvade || 0) + this.value;
  }
}
