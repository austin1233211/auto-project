/**
 * Base class for all ability effects using the strategy pattern.
 * Each ability effect implements the apply() method to modify hero stats.
 */
export class BaseEffect {
  constructor(value) {
    this.value = value;
  }

  /**
   * Applies this effect to the hero's stats.
   * @param {Object} stats - The hero's stats object to modify
   */
  apply(stats) {
    throw new Error('apply() must be implemented by subclass');
  }

  /**
   * Helper to add a percentage-based stat (e.g., 0.15 for 15%)
   */
  addPercentage(stats, statName) {
    stats[statName] = (stats[statName] || 0) + (this.value / 100);
  }

  /**
   * Helper to add a flat value to a stat
   */
  addFlat(stats, statName) {
    stats[statName] = (stats[statName] || 0) + this.value;
  }

  /**
   * Helper to multiply a stat by a percentage
   */
  multiplyBy(stats, statName, percentage) {
    stats[statName] *= (1 + percentage / 100);
  }
}
