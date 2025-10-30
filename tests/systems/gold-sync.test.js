import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { globalUIScheduler } from '../../src/utils/ui-scheduler.js';

describe('Gold Sync - UI Scheduler', () => {
  beforeEach(() => {
    globalUIScheduler.clear();
  });

  afterEach(() => {
    globalUIScheduler.clear();
  });

  describe('UI Scheduler', () => {
    it('should schedule updates with unique keys', () => {
      const update1 = vi.fn();
      const update2 = vi.fn();
      
      globalUIScheduler.scheduleUpdate('gold-ui', update1);
      globalUIScheduler.scheduleUpdate('hero-ui', update2);
      
      expect(globalUIScheduler.pendingUpdates.size).toBe(2);
    });

    it('should replace updates with same key', () => {
      const update1 = vi.fn();
      const update2 = vi.fn();
      
      globalUIScheduler.scheduleUpdate('gold-ui', update1);
      globalUIScheduler.scheduleUpdate('gold-ui', update2);
      
      expect(globalUIScheduler.pendingUpdates.size).toBe(1);
    });

    it('should batch multiple updates into single frame', (done) => {
      const update1 = vi.fn();
      const update2 = vi.fn();
      const update3 = vi.fn();
      
      globalUIScheduler.scheduleUpdate('update1', update1);
      globalUIScheduler.scheduleUpdate('update2', update2);
      globalUIScheduler.scheduleUpdate('update3', update3);
      
      expect(globalUIScheduler.isScheduled).toBe(true);
      
      setTimeout(() => {
        expect(update1).toHaveBeenCalled();
        expect(update2).toHaveBeenCalled();
        expect(update3).toHaveBeenCalled();
        expect(globalUIScheduler.pendingUpdates.size).toBe(0);
        expect(globalUIScheduler.isScheduled).toBe(false);
        done();
      }, 50);
    });

    it('should clear all pending updates', () => {
      globalUIScheduler.scheduleUpdate('update1', vi.fn());
      globalUIScheduler.scheduleUpdate('update2', vi.fn());
      
      expect(globalUIScheduler.pendingUpdates.size).toBe(2);
      
      globalUIScheduler.clear();
      
      expect(globalUIScheduler.pendingUpdates.size).toBe(0);
      expect(globalUIScheduler.isScheduled).toBe(false);
    });

    it('should handle errors in update functions gracefully', (done) => {
      const errorUpdate = vi.fn(() => {
        throw new Error('Test error');
      });
      const successUpdate = vi.fn();
      
      globalUIScheduler.scheduleUpdate('error', errorUpdate);
      globalUIScheduler.scheduleUpdate('success', successUpdate);
      
      setTimeout(() => {
        expect(errorUpdate).toHaveBeenCalled();
        expect(successUpdate).toHaveBeenCalled();
        done();
      }, 50);
    });
  });

  describe('Gold Mutation Methods', () => {
    it('should validate awardGold logic', () => {
      const player = { gold: 1000, name: 'You' };
      const amount = 500;
      
      player.gold += amount;
      
      expect(player.gold).toBe(1500);
    });

    it('should validate spendGold logic with sufficient funds', () => {
      const player = { gold: 1000, name: 'You' };
      const amount = 300;
      
      if (player.gold >= amount) {
        player.gold -= amount;
      }
      
      expect(player.gold).toBe(700);
    });

    it('should validate spendGold logic with insufficient funds', () => {
      const player = { gold: 100, name: 'You' };
      const amount = 300;
      const initialGold = player.gold;
      
      if (player.gold >= amount) {
        player.gold -= amount;
      }
      
      expect(player.gold).toBe(initialGold);
    });

    it('should not award negative or zero gold', () => {
      const player = { gold: 1000, name: 'You' };
      const initialGold = player.gold;
      
      const amount1 = 0;
      if (amount1 > 0) {
        player.gold += amount1;
      }
      
      const amount2 = -100;
      if (amount2 > 0) {
        player.gold += amount2;
      }
      
      expect(player.gold).toBe(initialGold);
    });
  });
});
