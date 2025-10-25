import { BaseEffect } from '../base-effect.js';

export class DrumsOfSlomEffect extends BaseEffect {
  apply(stats) {
    stats.drumsOfSlom = (stats.drumsOfSlom || 0) + (this.value / 100);
  }
}
