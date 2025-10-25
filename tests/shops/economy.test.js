import { describe, it, expect, beforeEach } from 'vitest';
import { Economy } from '../../src/shops/economy.js';
import { RNG } from '../../src/utils/rng.js';

describe('Economy', () => {
  let economy;

  beforeEach(() => {
    economy = new Economy();
  });

  describe('generateItemTier()', () => {
    it('should generate valid tiers (1-3)', () => {
      const rng = new RNG(12345);
      const originalRandom = Math.random;
      Math.random = () => rng.random();

      for (let round = 1; round <= 20; round++) {
        const tier = economy.generateItemTier(round);
        expect(tier).toBeGreaterThanOrEqual(1);
        expect(tier).toBeLessThanOrEqual(3);
      }

      Math.random = originalRandom;
    });

    it('should have higher tier 1 probability in early rounds', () => {
      const probs = economy.getTierProbabilities(1);
      expect(probs.tier1).toBeGreaterThan(probs.tier3);
    });

    it('should have higher tier 3 probability in later rounds', () => {
      const probs = economy.getTierProbabilities(15);
      expect(probs.tier3).toBeGreaterThan(probs.tier1);
    });
  });

  describe('awardMoney()', () => {
    let player;

    beforeEach(() => {
      player = { gold: 300, consecutiveWins: 0, consecutiveLosses: 0 };
    });

    it('should give base gold for victory', () => {
      const result = economy.awardMoney(player, true, 0, 0);
      expect(result.reward).toBeGreaterThan(0);
      expect(player.gold).toBeGreaterThan(300);
    });

    it('should give less gold for defeat than victory', () => {
      const player1 = { gold: 300, consecutiveWins: 0, consecutiveLosses: 0 };
      const player2 = { gold: 300, consecutiveWins: 0, consecutiveLosses: 0 };

      const victoryResult = economy.awardMoney(player1, true, 0, 0);
      const defeatResult = economy.awardMoney(player2, false, 0, 0);

      expect(defeatResult.reward).toBeLessThan(victoryResult.reward);
    });

    it('should give bonus for HP lost on defeat', () => {
      const player1 = { gold: 300, consecutiveWins: 0, consecutiveLosses: 0 };
      const player2 = { gold: 300, consecutiveWins: 0, consecutiveLosses: 0 };

      const noHpLost = economy.awardMoney(player1, false, 0, 0);
      const withHpLost = economy.awardMoney(player2, false, 2, 0);

      expect(withHpLost.reward).toBeGreaterThan(noHpLost.reward);
    });

    it('should give bonus for win streak', () => {
      player.consecutiveWins = 3;
      const result = economy.awardMoney(player, true, 0, 0);
      expect(result.breakdown.streakBonus).toBeGreaterThan(0);
    });

    it('should give bonus for loss streak', () => {
      player.consecutiveLosses = 3;
      const result = economy.awardMoney(player, false, 1, 0);
      expect(result.breakdown.streakBonus).toBeGreaterThan(0);
    });

    it('should update win/loss streaks correctly', () => {
      economy.awardMoney(player, true, 0, 0);
      expect(player.consecutiveWins).toBe(1);
      expect(player.consecutiveLosses).toBe(0);

      economy.awardMoney(player, false, 1, 0);
      expect(player.consecutiveWins).toBe(0);
      expect(player.consecutiveLosses).toBe(1);
    });

    it('should give interest on gold', () => {
      player.gold = 500;
      const result = economy.awardMoney(player, true, 0, 0);
      expect(result.breakdown.interest).toBeGreaterThan(0);
    });
  });

  describe('canAfford() and spendMoney()', () => {
    let player;

    beforeEach(() => {
      player = { gold: 300 };
    });

    it('should correctly check if player can afford', () => {
      expect(economy.canAfford(player, 200)).toBe(true);
      expect(economy.canAfford(player, 400)).toBe(false);
    });

    it('should spend money when affordable', () => {
      const success = economy.spendMoney(player, 200);
      expect(success).toBe(true);
      expect(player.gold).toBe(100);
    });

    it('should not spend money when not affordable', () => {
      const success = economy.spendMoney(player, 400);
      expect(success).toBe(false);
      expect(player.gold).toBe(300);
    });
  });
});
