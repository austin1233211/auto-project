import { BaseEffect } from '../base-effect.js';

export class EvadeDamageReflectEffect extends BaseEffect {
  apply(stats) {
    stats.evadeDamageReflect = (stats.evadeDamageReflect || 0) + (this.value / 100);
  }
}
