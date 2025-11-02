import { BaseEffect } from '../../base-effect.js';

export class CritManaEffect extends BaseEffect {
  apply(stats) {
    stats.critManaRestore = (stats.critManaRestore || 0) + this.value;
  }
}
