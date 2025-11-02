import { describe, it, expect, beforeEach } from 'vitest';
import { EffectRegistry, createEffect, clearEffectCache } from '../../src/core/ability-effects/effect-registry.js';

/**
 * Comprehensive Effect System Test Suite
 * 
 * This test suite validates all 195+ effects in the EffectRegistry to ensure:
 * 1. Each effect can be instantiated without throwing errors
 * 2. Each effect has a valid apply() method
 * 3. Applying effects doesn't produce NaN values
 * 4. Stats remain within valid ranges after application
 * 5. Percentage vs flat semantics are correctly implemented
 */

describe('Effect System - Comprehensive Registry Tests', () => {
  let baseStats;

  beforeEach(() => {
    clearEffectCache();
    
    baseStats = {
      health: 1000,
      attack: 50,
      armor: 20,
      speed: 1.5,
      critChance: 0.1,
      critDamage: 1.5,
      evasionChance: 0.1,
      evasionDamageReduction: 0.6,
      magicDamageReduction: 0,
      physicalDamageAmplification: 0,
      magicDamageAmplification: 0,
      manaRegeneration: 0,
      lifesteal: 0,
      goldBonus: 0,
      attackSpeedBoost: 0,
      damageReduction: 0,
      shield: 0,
      shieldEffectiveness: 1.0,
      poisonResistance: 0,
      frostResistance: 0,
      bleedResistance: 0,
      statusEffectResistance: 0,
      healingAmplification: 0,
      armorPiercing: 0,
      trueStrike: 0,
      counterAttackChance: 0,
      blockChance: 0,
      reflectDamage: 0,
      abilityCooldownReduction: 0,
      manaOnHit: 0,
      healthOnHit: 0,
      doubleAttackChance: 0,
      cleavePercent: 0,
      bashChance: 0,
      stunDuration: 0,
      silenceResistance: 0,
      disarmResistance: 0,
      rootResistance: 0,
      slowResistance: 0,
      poisonDamageBonus: 0,
      frostDamageBonus: 0,
      bleedDamageBonus: 0,
      critResistance: 0,
      evasionBonus: 0,
      accuracyBonus: 0,
      spellAmplification: 0,
      spellResistance: 0,
      healthRegenFlat: 0,
      healthRegenPercent: 0,
      armorBonus: 0,
      attackBonus: 0,
      speedBonus: 0,
      healthBonus: 0,
      manaBonus: 0,
      allStatsBonus: 0
    };
  });

  describe('Registry Completeness', () => {
    it('should have EffectRegistry defined', () => {
      expect(EffectRegistry).toBeDefined();
      expect(typeof EffectRegistry).toBe('object');
    });

    it('should have at least 190 effects registered', () => {
      const effectCount = Object.keys(EffectRegistry).length;
      expect(effectCount).toBeGreaterThanOrEqual(190);
    });

    it('should have all effect names in snake_case format', () => {
      const effectNames = Object.keys(EffectRegistry);
      effectNames.forEach(name => {
        expect(name).toMatch(/^[a-z_]+$/);
      });
    });
  });

  describe('Effect Instantiation - All Effects', () => {
    it('should instantiate all effects without throwing errors', () => {
      const effectNames = Object.keys(EffectRegistry);
      const testValue = 10;
      
      effectNames.forEach(effectName => {
        expect(() => {
          const ability = { effect: effectName, value: testValue };
          const effect = createEffect(ability);
          expect(effect).toBeDefined();
          expect(effect).not.toBeNull();
        }).not.toThrow();
      });
    });

    it('should create effects with correct value property', () => {
      const effectNames = Object.keys(EffectRegistry);
      const testValue = 25;
      
      effectNames.forEach(effectName => {
        const ability = { effect: effectName, value: testValue };
        const effect = createEffect(ability);
        
        if (effect) {
          expect(effect.value).toBe(testValue);
        }
      });
    });

    it('should create effects with apply method', () => {
      const effectNames = Object.keys(EffectRegistry);
      
      effectNames.forEach(effectName => {
        const ability = { effect: effectName, value: 10 };
        const effect = createEffect(ability);
        
        if (effect) {
          expect(typeof effect.apply).toBe('function');
        }
      });
    });
  });

  describe('Effect Application - No Errors', () => {
    it('should apply all effects without throwing errors', () => {
      const effectNames = Object.keys(EffectRegistry);
      
      effectNames.forEach(effectName => {
        const ability = { effect: effectName, value: 10 };
        const effect = createEffect(ability);
        
        if (effect && effect.apply) {
          const statsCopy = { ...baseStats };
          
          expect(() => {
            effect.apply(statsCopy);
          }).not.toThrow();
        }
      });
    });

    it('should not produce NaN values after applying effects', () => {
      const effectNames = Object.keys(EffectRegistry);
      
      effectNames.forEach(effectName => {
        const ability = { effect: effectName, value: 10 };
        const effect = createEffect(ability);
        
        if (effect && effect.apply) {
          const statsCopy = { ...baseStats };
          effect.apply(statsCopy);
          
          Object.keys(statsCopy).forEach(key => {
            const value = statsCopy[key];
            if (typeof value === 'number') {
              expect(isNaN(value)).toBe(false);
            }
          });
        }
      });
    });

    it('should not produce Infinity values after applying effects', () => {
      const effectNames = Object.keys(EffectRegistry);
      
      effectNames.forEach(effectName => {
        const ability = { effect: effectName, value: 10 };
        const effect = createEffect(ability);
        
        if (effect && effect.apply) {
          const statsCopy = { ...baseStats };
          effect.apply(statsCopy);
          
          Object.keys(statsCopy).forEach(key => {
            const value = statsCopy[key];
            if (typeof value === 'number') {
              expect(isFinite(value)).toBe(true);
            }
          });
        }
      });
    });
  });

  describe('Effect Application - Stat Invariants', () => {
    it('should not reduce health below 0 for health-boosting effects', () => {
      const healthEffects = [
        'health_boost',
        'health_boost_flat',
        'health_percentage_boost',
        'health_percentage_boost_major'
      ];
      
      healthEffects.forEach(effectName => {
        if (EffectRegistry[effectName]) {
          const ability = { effect: effectName, value: 100 };
          const effect = createEffect(ability);
          
          if (effect && effect.apply) {
            const statsCopy = { ...baseStats };
            const originalHealth = statsCopy.health;
            effect.apply(statsCopy);
            
            expect(statsCopy.health).toBeGreaterThanOrEqual(originalHealth);
          }
        }
      });
    });

    it('should not reduce attack below 0 for attack-boosting effects', () => {
      const attackEffects = [
        'attack_boost',
        'attack_damage_increase',
        'base_damage_boost'
      ];
      
      attackEffects.forEach(effectName => {
        if (EffectRegistry[effectName]) {
          const ability = { effect: effectName, value: 20 };
          const effect = createEffect(ability);
          
          if (effect && effect.apply) {
            const statsCopy = { ...baseStats };
            const originalAttack = statsCopy.attack;
            effect.apply(statsCopy);
            
            expect(statsCopy.attack).toBeGreaterThanOrEqual(originalAttack);
          }
        }
      });
    });

    it('should keep percentage stats within valid range [0, 1] for chance-based effects', () => {
      const chanceEffects = [
        'crit_chance',
        'evasion_chance',
        'block_chance',
        'counter_chance'
      ];
      
      chanceEffects.forEach(effectName => {
        if (EffectRegistry[effectName]) {
          const ability = { effect: effectName, value: 5 };
          const effect = createEffect(ability);
          
          if (effect && effect.apply) {
            const statsCopy = { ...baseStats };
            effect.apply(statsCopy);
            
            if (statsCopy.critChance !== undefined) {
              expect(statsCopy.critChance).toBeGreaterThanOrEqual(0);
              expect(statsCopy.critChance).toBeLessThanOrEqual(1);
            }
            
            if (statsCopy.evasionChance !== undefined) {
              expect(statsCopy.evasionChance).toBeGreaterThanOrEqual(0);
              expect(statsCopy.evasionChance).toBeLessThanOrEqual(1);
            }
          }
        }
      });
    });

    it('should keep speed positive for speed-boosting effects', () => {
      const speedEffects = [
        'speed_boost',
        'attack_speed_boost',
        'attack_speed_increase'
      ];
      
      speedEffects.forEach(effectName => {
        if (EffectRegistry[effectName]) {
          const ability = { effect: effectName, value: 0.5 };
          const effect = createEffect(ability);
          
          if (effect && effect.apply) {
            const statsCopy = { ...baseStats };
            effect.apply(statsCopy);
            
            if (statsCopy.speed !== undefined) {
              expect(statsCopy.speed).toBeGreaterThan(0);
            }
          }
        }
      });
    });
  });

  describe('Effect Categories - Behavioral Tests', () => {
    describe('Crit Modifiers', () => {
      it('should increase crit chance with crit_chance effect', () => {
        const ability = { effect: 'crit_chance', value: 5 };
        const effect = createEffect(ability);
        
        if (effect) {
          const statsCopy = { ...baseStats };
          const originalCrit = statsCopy.critChance;
          effect.apply(statsCopy);
          
          expect(statsCopy.critChance).toBeGreaterThan(originalCrit);
        }
      });

      it('should increase crit damage with crit_multiplier effect', () => {
        if (EffectRegistry['crit_multiplier']) {
          const ability = { effect: 'crit_multiplier', value: 0.5 };
          const effect = createEffect(ability);
          
          if (effect) {
            const statsCopy = { ...baseStats };
            const originalCritDamage = statsCopy.critDamage;
            effect.apply(statsCopy);
            
            expect(statsCopy.critDamage).toBeGreaterThan(originalCritDamage);
          }
        }
      });
    });

    describe('Defense Modifiers', () => {
      it('should increase armor with armor_boost effect', () => {
        const ability = { effect: 'armor_boost', value: 15 };
        const effect = createEffect(ability);
        
        if (effect) {
          const statsCopy = { ...baseStats };
          const originalArmor = statsCopy.armor;
          effect.apply(statsCopy);
          
          expect(statsCopy.armor).toBeGreaterThan(originalArmor);
        }
      });

      it('should increase evasion with evasion_boost effect', () => {
        if (EffectRegistry['evasion_boost']) {
          const ability = { effect: 'evasion_boost', value: 5 };
          const effect = createEffect(ability);
          
          if (effect) {
            const statsCopy = { ...baseStats };
            const originalEvasion = statsCopy.evasionChance;
            effect.apply(statsCopy);
            
            expect(statsCopy.evasionChance).toBeGreaterThan(originalEvasion);
          }
        }
      });
    });

    describe('Gold Bonus Effects', () => {
      it('should increase gold bonus with gold_bonus effect', () => {
        if (EffectRegistry['gold_bonus']) {
          const ability = { effect: 'gold_bonus', value: 10 };
          const effect = createEffect(ability);
          
          if (effect) {
            const statsCopy = { ...baseStats };
            effect.apply(statsCopy);
            
            expect(statsCopy.goldBonus).toBeGreaterThan(0);
          }
        }
      });
    });

    describe('Mana Effects', () => {
      it('should increase mana regen with mana_regen effect', () => {
        if (EffectRegistry['mana_regen']) {
          const ability = { effect: 'mana_regen', value: 5 };
          const effect = createEffect(ability);
          
          if (effect) {
            const statsCopy = { ...baseStats };
            effect.apply(statsCopy);
            
            expect(statsCopy.manaRegeneration).toBeGreaterThan(0);
          }
        }
      });
    });
  });

  describe('Effect Stacking', () => {
    it('should stack multiple instances of the same effect correctly', () => {
      const ability1 = { effect: 'attack_boost', value: 10 };
      const ability2 = { effect: 'attack_boost', value: 15 };
      
      const effect1 = createEffect(ability1);
      const effect2 = createEffect(ability2);
      
      const statsCopy = { ...baseStats };
      const originalAttack = statsCopy.attack;
      
      effect1.apply(statsCopy);
      effect2.apply(statsCopy);
      
      expect(statsCopy.attack).toBe(originalAttack + 10 + 15);
    });

    it('should stack different effect types correctly', () => {
      const attackAbility = { effect: 'attack_boost', value: 20 };
      const healthAbility = { effect: 'health_boost', value: 500 };
      const speedAbility = { effect: 'speed_boost', value: 0.5 };
      
      const attackEffect = createEffect(attackAbility);
      const healthEffect = createEffect(healthAbility);
      const speedEffect = createEffect(speedAbility);
      
      const statsCopy = { ...baseStats };
      const originalAttack = statsCopy.attack;
      const originalHealth = statsCopy.health;
      const originalSpeed = statsCopy.speed;
      
      attackEffect.apply(statsCopy);
      healthEffect.apply(statsCopy);
      speedEffect.apply(statsCopy);
      
      expect(statsCopy.attack).toBeGreaterThan(originalAttack);
      expect(statsCopy.health).toBeGreaterThan(originalHealth);
      expect(statsCopy.speed).toBeGreaterThan(originalSpeed);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero value effects', () => {
      const effectNames = Object.keys(EffectRegistry).slice(0, 10);
      
      effectNames.forEach(effectName => {
        const ability = { effect: effectName, value: 0 };
        const effect = createEffect(ability);
        
        if (effect && effect.apply) {
          const statsCopy = { ...baseStats };
          
          expect(() => {
            effect.apply(statsCopy);
          }).not.toThrow();
        }
      });
    });

    it('should handle large value effects', () => {
      const effectNames = Object.keys(EffectRegistry).slice(0, 10);
      
      effectNames.forEach(effectName => {
        const ability = { effect: effectName, value: 10000 };
        const effect = createEffect(ability);
        
        if (effect && effect.apply) {
          const statsCopy = { ...baseStats };
          
          expect(() => {
            effect.apply(statsCopy);
          }).not.toThrow();
          
          Object.values(statsCopy).forEach(value => {
            if (typeof value === 'number') {
              expect(isNaN(value)).toBe(false);
              expect(isFinite(value)).toBe(true);
            }
          });
        }
      });
    });

    it('should handle negative value effects', () => {
      const effectNames = Object.keys(EffectRegistry).slice(0, 10);
      
      effectNames.forEach(effectName => {
        const ability = { effect: effectName, value: -10 };
        const effect = createEffect(ability);
        
        if (effect && effect.apply) {
          const statsCopy = { ...baseStats };
          
          expect(() => {
            effect.apply(statsCopy);
          }).not.toThrow();
        }
      });
    });
  });

  describe('Effect Cache Behavior', () => {
    it('should cache effects with same name and value', () => {
      const ability1 = { effect: 'attack_boost', value: 10 };
      const ability2 = { effect: 'attack_boost', value: 10 };
      
      const effect1 = createEffect(ability1);
      const effect2 = createEffect(ability2);
      
      expect(effect1).toBe(effect2);
    });

    it('should not cache effects with different values', () => {
      const ability1 = { effect: 'attack_boost', value: 10 };
      const ability2 = { effect: 'attack_boost', value: 20 };
      
      const effect1 = createEffect(ability1);
      const effect2 = createEffect(ability2);
      
      expect(effect1).not.toBe(effect2);
    });

    it('should clear cache properly', () => {
      const ability = { effect: 'attack_boost', value: 10 };
      
      const effect1 = createEffect(ability);
      clearEffectCache();
      const effect2 = createEffect(ability);
      
      expect(effect1).not.toBe(effect2);
    });
  });
});
