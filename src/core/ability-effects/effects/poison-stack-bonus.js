import { BaseEffect } from '../base-effect.js';

export class PoisonStackBonusEffect extends BaseEffect {
  apply(stats) {
    stats.poisonStackBonus = (stats.poisonStackBonus || 0) + this.value;
  }
}
