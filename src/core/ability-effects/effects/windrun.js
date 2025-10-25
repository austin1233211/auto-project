import { BaseEffect } from '../base-effect.js';

export class WindrunEffect extends BaseEffect {
  apply(stats) {
    stats.windrun = (stats.windrun || 0) + this.value;
  }
}
