import { BaseEffect } from '../base-effect.js';

export class DamagePoisonReflectEffect extends BaseEffect {
  apply(stats) {
    stats.damagePoisonReflect = (stats.damagePoisonReflect || 0) + this.value;
  }
}
