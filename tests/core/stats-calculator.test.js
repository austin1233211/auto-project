import { describe, it, expect, beforeEach } from 'vitest';
import { StatsCalculator } from '../../src/core/stats-calculator.js';

describe('StatsCalculator', () => {
  describe('calculateEffectiveAttack()', () => {
    it('should return base attack when below threshold', () => {
      expect(StatsCalculator.calculateEffectiveAttack(50)).toBe(50);
      expect(StatsCalculator.calculateEffectiveAttack(100)).toBe(100);
    });

    it('should apply diminishing returns above threshold', () => {
      const result = StatsCalculator.calculateEffectiveAttack(150);
      expect(result).toBe(130); // 100 + (50 * 0.6)
    });

    it('should handle large values', () => {
      const result = StatsCalculator.calculateEffectiveAttack(200);
      expect(result).toBe(160); // 100 + (100 * 0.6)
    });
  });

  describe('calculateEffectiveArmor()', () => {
    it('should return base armor when below threshold', () => {
      expect(StatsCalculator.calculateEffectiveArmor(50)).toBe(50);
      expect(StatsCalculator.calculateEffectiveArmor(100)).toBe(100);
    });

    it('should apply diminishing returns above threshold', () => {
      const result = StatsCalculator.calculateEffectiveArmor(150);
      expect(result).toBe(130); // 100 + (50 * 0.6)
    });
  });

  describe('calculateEffectiveSpeed()', () => {
    it('should return base speed when below threshold', () => {
      expect(StatsCalculator.calculateEffectiveSpeed(1.0)).toBe(1.0);
      expect(StatsCalculator.calculateEffectiveSpeed(2.0)).toBe(2.0);
    });

    it('should apply diminishing returns above threshold', () => {
      const result = StatsCalculator.calculateEffectiveSpeed(3.0);
      expect(result).toBeCloseTo(2.6, 5); // 2.0 + (1.0 * 0.6)
    });
  });

  describe('processHeroStats()', () => {
    let hero;

    beforeEach(() => {
      hero = {
        name: 'Test Hero',
        stats: {
          health: 1000,
          attack: 50,
          speed: 1.5,
          armor: 20
        },
        purchasedAbilities: []
      };
    });

    it('should process hero with no abilities', () => {
      const result = StatsCalculator.processHeroStats(hero);

      expect(result.effectiveStats.health).toBe(1000);
      expect(result.effectiveStats.attack).toBe(50);
      expect(result.effectiveStats.speed).toBe(1.5);
    });

    it('should apply attack boost ability', () => {
      hero.purchasedAbilities = [
        { effect: 'attack_boost', value: 20 }
      ];

      const result = StatsCalculator.processHeroStats(hero);
      expect(result.effectiveStats.attack).toBe(70); // 50 + 20
    });

    it('should apply health boost ability', () => {
      hero.purchasedAbilities = [
        { effect: 'health_boost', value: 500 }
      ];

      const result = StatsCalculator.processHeroStats(hero);
      expect(result.effectiveStats.health).toBe(1500); // 1000 + 500
    });

    it('should apply multiple abilities', () => {
      hero.purchasedAbilities = [
        { effect: 'attack_boost', value: 20 },
        { effect: 'health_boost', value: 500 },
        { effect: 'speed_boost', value: 0.5 }
      ];

      const result = StatsCalculator.processHeroStats(hero);
      expect(result.effectiveStats.attack).toBe(70);
      expect(result.effectiveStats.health).toBe(1500);
      expect(result.effectiveStats.speed).toBeCloseTo(2.0, 5);
    });

    it('should apply crit chance ability', () => {
      hero.purchasedAbilities = [
        { effect: 'crit_chance', value: 5 }
      ];

      const result = StatsCalculator.processHeroStats(hero);
      expect(result.effectiveStats.critChance).toBeCloseTo(0.05, 5);
    });

    it('should apply evasion chance ability', () => {
      hero.purchasedAbilities = [
        { effect: 'evasion_chance', value: 3 }
      ];

      const result = StatsCalculator.processHeroStats(hero);
      expect(result.effectiveStats.evasionChance).toBeCloseTo(0.03, 5);
    });

    it('should handle equipment effects', () => {
      hero.equipment = [
        {
          name: 'Test Sword',
          effects: {
            attackFlat: 15,
            critChancePct: 5
          }
        }
      ];

      const result = StatsCalculator.processHeroStats(hero);
      expect(result.effectiveStats.attack).toBe(65); // 50 + 15
      expect(result.effectiveStats.critChance).toBeCloseTo(0.05, 5);
    });

    it('should apply both abilities and equipment', () => {
      hero.purchasedAbilities = [
        { effect: 'attack_boost', value: 20 }
      ];
      hero.equipment = [
        {
          name: 'Test Sword',
          effects: {
            attackFlat: 15
          }
        }
      ];

      const result = StatsCalculator.processHeroStats(hero);
      expect(result.effectiveStats.attack).toBe(85); // 50 + 20 + 15
    });

    it('should preserve original hero object', () => {
      const originalHealth = hero.stats.health;
      hero.purchasedAbilities = [
        { effect: 'health_boost', value: 500 }
      ];

      StatsCalculator.processHeroStats(hero);
      expect(hero.stats.health).toBe(originalHealth);
    });
  });
});
