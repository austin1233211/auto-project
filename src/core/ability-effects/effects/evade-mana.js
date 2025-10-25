import { BaseEffect } from '../base-effect.js';

export class EvadeManaEffect extends BaseEffect {
  apply(stats) {
    stats.evadeManaRestore = (stats.evadeManaRestore || 0) + this.value;
  }
}
