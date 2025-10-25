import { BaseEffect } from '../base-effect.js';

export class SelfPoisonReflectEffect extends BaseEffect {
  apply(stats) {
    stats.selfPoisonReflect = (stats.selfPoisonReflect || 0) + this.value;
  }
}
