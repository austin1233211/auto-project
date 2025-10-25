import { BaseEffect } from '../base-effect.js';

export class HealthArmorBonusEffect extends BaseEffect {
  apply(stats) {
    stats.healthArmorBonus = (stats.healthArmorBonus || 0) + (this.value / 100);
  }
}
