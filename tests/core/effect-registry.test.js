import { describe, it, expect, beforeEach } from 'vitest';
import { createEffect, clearEffectCache } from '../../src/core/ability-effects/effect-registry.js';

describe('Effect Registry', () => {
  beforeEach(() => {
    clearEffectCache();
  });

  describe('createEffect()', () => {
    it('should create effect instance for valid ability', () => {
      const ability = { effect: 'attack_boost', value: 10 };
      const effect = createEffect(ability);

      expect(effect).toBeDefined();
      expect(effect.value).toBe(10);
    });

    it('should return null for unknown effect type', () => {
      const ability = { effect: 'unknown_effect', value: 5 };
      const effect = createEffect(ability);

      expect(effect).toBeNull();
    });

    it('should cache effect instances', () => {
      const ability1 = { effect: 'attack_boost', value: 10 };
      const ability2 = { effect: 'attack_boost', value: 10 };

      const effect1 = createEffect(ability1);
      const effect2 = createEffect(ability2);

      expect(effect1).toBe(effect2);
    });

    it('should create different instances for different values', () => {
      const ability1 = { effect: 'attack_boost', value: 10 };
      const ability2 = { effect: 'attack_boost', value: 20 };

      const effect1 = createEffect(ability1);
      const effect2 = createEffect(ability2);

      expect(effect1).not.toBe(effect2);
      expect(effect1.value).toBe(10);
      expect(effect2.value).toBe(20);
    });

    it('should create different instances for different effects', () => {
      const ability1 = { effect: 'attack_boost', value: 10 };
      const ability2 = { effect: 'health_boost', value: 10 };

      const effect1 = createEffect(ability1);
      const effect2 = createEffect(ability2);

      expect(effect1).not.toBe(effect2);
    });
  });

  describe('clearEffectCache()', () => {
    it('should clear the effect cache', () => {
      const ability = { effect: 'attack_boost', value: 10 };

      const effect1 = createEffect(ability);
      clearEffectCache();
      const effect2 = createEffect(ability);

      expect(effect1).not.toBe(effect2);
    });
  });
});
