import { BaseEffect } from '../../base-effect.js';

export class VendettaEffect extends BaseEffect {
  apply(stats) {
    stats.vendetta = true;
  }
}
