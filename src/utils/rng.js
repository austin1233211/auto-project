/**
 * Seedable Random Number Generator
 * Provides deterministic random numbers for testing and reproducibility
 */
export class RNG {
  constructor(seed = Date.now()) {
    this.seed = seed;
    this.state = seed;
  }

  /**
   * Generate next random number between 0 and 1 (exclusive of 1)
   * Uses a simple LCG (Linear Congruential Generator) algorithm
   */
  random() {
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    
    this.state = (a * this.state + c) % m;
    return this.state / m;
  }

  /**
   * Generate random integer between min (inclusive) and max (exclusive)
   */
  randomInt(min, max) {
    return Math.floor(this.random() * (max - min)) + min;
  }

  /**
   * Generate random float between min and max
   */
  randomFloat(min, max) {
    return this.random() * (max - min) + min;
  }

  /**
   * Choose random element from array
   */
  choice(array) {
    return array[this.randomInt(0, array.length)];
  }

  /**
   * Shuffle array in place (Fisher-Yates algorithm)
   */
  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Reset RNG to initial seed
   */
  reset() {
    this.state = this.seed;
  }

  /**
   * Set new seed
   */
  setSeed(seed) {
    this.seed = seed;
    this.state = seed;
  }
}

export const globalRNG = new RNG();

export function random() {
  return globalRNG.random();
}

export function randomInt(min, max) {
  return globalRNG.randomInt(min, max);
}

export function randomFloat(min, max) {
  return globalRNG.randomFloat(min, max);
}

export function choice(array) {
  return globalRNG.choice(array);
}

export function shuffle(array) {
  return globalRNG.shuffle(array);
}
