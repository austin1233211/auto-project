import { describe, it, expect, beforeEach } from 'vitest';
import { RNG } from '../../src/utils/rng.js';

describe('RNG', () => {
  let rng;

  beforeEach(() => {
    rng = new RNG(12345);
  });

  describe('random()', () => {
    it('should generate numbers between 0 and 1', () => {
      for (let i = 0; i < 100; i++) {
        const value = rng.random();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('should generate deterministic sequence with same seed', () => {
      const rng1 = new RNG(12345);
      const rng2 = new RNG(12345);

      const sequence1 = Array.from({ length: 10 }, () => rng1.random());
      const sequence2 = Array.from({ length: 10 }, () => rng2.random());

      expect(sequence1).toEqual(sequence2);
    });

    it('should generate different sequences with different seeds', () => {
      const rng1 = new RNG(12345);
      const rng2 = new RNG(54321);

      const sequence1 = Array.from({ length: 10 }, () => rng1.random());
      const sequence2 = Array.from({ length: 10 }, () => rng2.random());

      expect(sequence1).not.toEqual(sequence2);
    });
  });

  describe('randomInt()', () => {
    it('should generate integers within range', () => {
      for (let i = 0; i < 100; i++) {
        const value = rng.randomInt(1, 10);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThan(10);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('should generate deterministic integers', () => {
      const rng1 = new RNG(12345);
      const rng2 = new RNG(12345);

      const sequence1 = Array.from({ length: 10 }, () => rng1.randomInt(1, 100));
      const sequence2 = Array.from({ length: 10 }, () => rng2.randomInt(1, 100));

      expect(sequence1).toEqual(sequence2);
    });
  });

  describe('choice()', () => {
    it('should choose element from array', () => {
      const array = ['a', 'b', 'c', 'd', 'e'];
      for (let i = 0; i < 50; i++) {
        const value = rng.choice(array);
        expect(array).toContain(value);
      }
    });

    it('should be deterministic', () => {
      const array = [1, 2, 3, 4, 5];
      const rng1 = new RNG(12345);
      const rng2 = new RNG(12345);

      const choices1 = Array.from({ length: 10 }, () => rng1.choice(array));
      const choices2 = Array.from({ length: 10 }, () => rng2.choice(array));

      expect(choices1).toEqual(choices2);
    });
  });

  describe('shuffle()', () => {
    it('should shuffle array', () => {
      const array = [1, 2, 3, 4, 5];
      const shuffled = rng.shuffle(array);

      expect(shuffled).toHaveLength(array.length);
      expect(shuffled.sort()).toEqual(array.sort());
    });

    it('should be deterministic', () => {
      const array = [1, 2, 3, 4, 5];
      const rng1 = new RNG(12345);
      const rng2 = new RNG(12345);

      const shuffled1 = rng1.shuffle(array);
      const shuffled2 = rng2.shuffle(array);

      expect(shuffled1).toEqual(shuffled2);
    });

    it('should not modify original array', () => {
      const array = [1, 2, 3, 4, 5];
      const original = [...array];
      rng.shuffle(array);

      expect(array).toEqual(original);
    });
  });

  describe('reset()', () => {
    it('should reset to initial seed', () => {
      const sequence1 = Array.from({ length: 5 }, () => rng.random());
      rng.reset();
      const sequence2 = Array.from({ length: 5 }, () => rng.random());

      expect(sequence1).toEqual(sequence2);
    });
  });

  describe('setSeed()', () => {
    it('should change seed and generate new sequence', () => {
      const sequence1 = Array.from({ length: 5 }, () => rng.random());
      rng.setSeed(54321);
      const sequence2 = Array.from({ length: 5 }, () => rng.random());

      expect(sequence1).not.toEqual(sequence2);
    });
  });
});
