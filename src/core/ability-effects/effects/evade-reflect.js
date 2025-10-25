import { BaseEffect } from '../base-effect.js';

export class EvadeReflectEffect extends BaseEffect {
  apply(stats) {
    stats.evadeReflect = (stats.evadeReflect || 0) + (this.value / 100);
  }
}
