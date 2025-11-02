import { BaseEffect } from '../../base-effect.js';

export class DeathImmunityShieldEffect extends BaseEffect {
  apply(stats) {
    stats.deathImmunityShield = (stats.deathImmunityShield || 0) + this.value;
  }
}
