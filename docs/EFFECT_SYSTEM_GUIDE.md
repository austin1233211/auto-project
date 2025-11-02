# Effect System Guide

## Overview

The Auto Gladiators effect system is a comprehensive, registry-driven architecture that manages 195+ unique ability effects. This guide documents the effect semantics, application order, trigger categories, and how to add new effects to the system.

## Architecture

### Core Components

#### 1. BaseEffect (`src/core/ability-effects/base-effect.js`)

The abstract base class that all effects extend. Provides helper methods for stat modifications:

```javascript
class BaseEffect {
  constructor(value) {
    this.value = value;
  }

  // Helper methods
  addPercentage(stats, statName) {
    stats[statName] = (stats[statName] || 0) * (1 + this.value / 100);
  }

  addFlat(stats, statName) {
    stats[statName] = (stats[statName] || 0) + this.value;
  }

  multiplyBy(stats, statName, percentage) {
    stats[statName] = (stats[statName] || 0) * (1 + percentage / 100);
  }

  // Must be implemented by subclasses
  apply(stats) {
    throw new Error('apply() must be implemented by subclass');
  }
}
```

#### 2. EffectRegistry (`src/core/ability-effects/effect-registry.js`)

Central registry mapping effect name strings to effect class constructors:

```javascript
export const EffectRegistry = {
  'attack_boost': AttackBoostEffect,
  'health_boost': HealthBoostEffect,
  'armor_boost': ArmorBoostEffect,
  // ... 195+ more effects
};
```

#### 3. createEffect() Factory Function

Instantiates effects from ability data:

```javascript
export function createEffect(ability) {
  const EffectClass = EffectRegistry[ability.effect];
  if (!EffectClass) {
    logger.warn(`Unknown effect: ${ability.effect}`);
    return null;
  }
  return new EffectClass(ability.value);
}
```

## Effect Semantics

### Flat vs Percentage Effects

Effects use two primary modification patterns:

**Flat Effects** - Add a fixed value to a stat:
```javascript
class AttackBoostEffect extends BaseEffect {
  apply(stats) {
    stats.attack += this.value; // Adds flat value
  }
}
```

**Percentage Effects** - Multiply a stat by a percentage:
```javascript
class AttackSpeedBoostEffect extends BaseEffect {
  apply(stats) {
    stats.attackSpeedBoost += this.value / 100; // Adds percentage (0.15 = 15%)
  }
}
```

### Effect Value Conventions

- **Flat values**: Direct numeric values (e.g., `value: 50` adds 50 attack)
- **Percentage values**: Stored as whole numbers, divided by 100 when applied (e.g., `value: 15` = 15% boost)
- **Chance values**: Stored as decimals 0-1 (e.g., `value: 0.25` = 25% chance)

## Effect Categories

### 1. Combat Modifiers

Direct stat modifications that affect combat calculations:

- **Attack**: `attack_boost`, `attack_percent_boost`
- **Defense**: `armor_boost`, `armor_percent_boost`, `resistance_boost`
- **Speed**: `attack_speed_boost`, `movement_speed_boost`
- **Critical**: `crit_chance_boost`, `crit_damage_boost`
- **Evasion**: `evasion_boost`, `dodge_chance_boost`

### 2. Status Effects

Damage-over-time and debuff effects:

- **Poison**: `poison_damage`, `poison_aura`, `attack_poison_chance`
- **Frost**: `frost_slow`, `frost_aura`, `attack_frost_chance`
- **Bleed**: `bleed_damage`, `bleed_stack`, `attack_bleed_chance`
- **Burn**: `burn_damage`, `burn_aura`
- **Stun**: `stun_chance`, `stun_duration`

### 3. Resource Management

Effects that modify health, mana, shields, and gold:

- **Health**: `health_boost`, `health_regen`, `max_health_percent`
- **Mana**: `mana_regen`, `mana_on_hit`, `max_mana_boost`
- **Shield**: `shield_on_hit`, `shield_regen`, `max_shield_boost`
- **Gold**: `gold_bonus`, `gold_per_kill`, `gold_on_crit`

### 4. Conditional Effects

Effects that trigger based on specific conditions:

- **Low HP**: `low_health_damage`, `low_health_armor`, `low_health_heal`
- **Kill Bonuses**: `kill_attack_boost`, `kill_heal`, `kill_gold`
- **Crit Bonuses**: `crit_heal`, `crit_mana`, `crit_gold`
- **On-Hit**: `lifesteal`, `mana_steal`, `damage_reflect`

### 5. Unique Mechanics

Special effects with complex behaviors:

- **Death Saves**: `death_save_chance`, `ultimate_rescue`
- **Auras**: `poison_aura`, `frost_aura`, `heal_aura`
- **Summons**: `summon_minion`, `summon_on_death`
- **Named Abilities**: Hero-specific ultimate effects

## Application Order

Effects are applied in the following order during stat calculation:

1. **Base Stats** - Hero's base stats loaded
2. **Flat Modifiers** - Flat value effects applied first
3. **Percentage Modifiers** - Percentage effects applied to modified values
4. **Conditional Checks** - Conditional effects evaluated
5. **Final Calculations** - Combat stats computed

Example flow:
```javascript
// 1. Base stats
stats.attack = 50;

// 2. Flat modifiers
stats.attack += 20; // attack_boost effect
// stats.attack = 70

// 3. Percentage modifiers
stats.attack *= 1.15; // attack_percent_boost (15%)
// stats.attack = 80.5

// 4. Conditional checks
if (stats.health < stats.maxHealth * 0.3) {
  stats.attack *= 1.5; // low_health_damage effect
  // stats.attack = 120.75
}
```

## Trigger Categories

Effects trigger at different points in the game loop:

### Pre-Combat Triggers
- Stat modifications applied before battle starts
- Aura effects initialized
- Persistent effects loaded

### Combat Triggers
- **On Attack**: `lifesteal`, `mana_on_hit`, `attack_poison_chance`
- **On Hit Taken**: `damage_reflect`, `thorns_damage`
- **On Crit**: `crit_heal`, `crit_mana`, `crit_gold`
- **On Kill**: `kill_attack_boost`, `kill_heal`, `kill_gold`

### Post-Combat Triggers
- Status effect damage applied (poison, bleed, burn)
- Regeneration effects processed
- Death save checks performed

### Round Triggers
- Gold bonuses calculated
- Persistent effects updated
- Equipment effects applied

## Adding New Effects

### Step 1: Create Effect Class

Create a new file in `src/core/ability-effects/effects/`:

```javascript
// src/core/ability-effects/effects/my-new-effect.js
import { BaseEffect } from '../base-effect.js';

export class MyNewEffect extends BaseEffect {
  apply(stats) {
    // Implement your effect logic
    stats.myNewStat = (stats.myNewStat || 0) + this.value;
  }
}
```

### Step 2: Register Effect

Add to `EffectRegistry` in `effect-registry.js`:

```javascript
import { MyNewEffect } from './effects/my-new-effect.js';

export const EffectRegistry = {
  // ... existing effects
  'my_new_effect': MyNewEffect,
};
```

### Step 3: Add to Hero Abilities

Use the effect in hero ability definitions:

```javascript
{
  name: "My New Ability",
  effect: "my_new_effect",
  value: 25,
  tier: 1,
  cost: 100
}
```

### Step 4: Test the Effect

Add tests in `tests/core/effect-system-comprehensive.test.js`:

```javascript
it('should apply my_new_effect correctly', () => {
  const ability = { effect: 'my_new_effect', value: 25 };
  const effect = createEffect(ability);
  const stats = { myNewStat: 0 };
  
  effect.apply(stats);
  
  expect(stats.myNewStat).toBe(25);
});
```

## Effect Registry Audit Checklist

When adding or modifying effects, verify:

- [ ] Effect class extends `BaseEffect`
- [ ] `apply(stats)` method is implemented
- [ ] Effect is registered in `EffectRegistry`
- [ ] Effect name uses snake_case convention
- [ ] Value semantics are documented (flat/percentage/chance)
- [ ] Effect doesn't produce NaN or Infinity values
- [ ] Effect is tested in comprehensive test suite
- [ ] Effect is used in at least one hero ability
- [ ] Effect behavior is documented in this guide

## Common Patterns

### Pattern 1: Simple Stat Boost
```javascript
class StatBoostEffect extends BaseEffect {
  apply(stats) {
    this.addFlat(stats, 'targetStat');
  }
}
```

### Pattern 2: Percentage Boost
```javascript
class PercentBoostEffect extends BaseEffect {
  apply(stats) {
    this.addPercentage(stats, 'targetStat');
  }
}
```

### Pattern 3: Conditional Effect
```javascript
class ConditionalEffect extends BaseEffect {
  apply(stats) {
    if (stats.health < stats.maxHealth * 0.5) {
      this.addFlat(stats, 'targetStat');
    }
  }
}
```

### Pattern 4: Multi-Stat Effect
```javascript
class MultiStatEffect extends BaseEffect {
  apply(stats) {
    this.addFlat(stats, 'attack');
    this.addFlat(stats, 'armor');
    this.addFlat(stats, 'speed');
  }
}
```

### Pattern 5: Chance-Based Effect
```javascript
class ChanceEffect extends BaseEffect {
  apply(stats) {
    stats.specialChance = (stats.specialChance || 0) + this.value;
  }
}
```

## Debugging Effects

### Enable Debug Logging

Set `localStorage.setItem('debugMode', 'true')` in browser console to see effect application logs.

### Common Issues

**Issue**: Effect not applying
- **Check**: Effect registered in `EffectRegistry`?
- **Check**: Effect name matches exactly (case-sensitive)?
- **Check**: `apply()` method implemented?

**Issue**: NaN values after effect application
- **Check**: All stat values initialized before modification?
- **Check**: Division by zero checks in place?
- **Check**: Percentage values divided by 100?

**Issue**: Effect applying multiple times
- **Check**: Effect cache cleared between battles?
- **Check**: Effect not duplicated in ability list?
- **Check**: Effect application order correct?

## Performance Considerations

- Effects are cached per ability to avoid re-instantiation
- Use `clearEffectCache()` between battles to prevent memory leaks
- Avoid complex calculations in `apply()` - keep it simple
- Batch stat modifications when possible

## Testing

The comprehensive effect test suite (`tests/core/effect-system-comprehensive.test.js`) validates:

1. **Instantiation**: All 195+ effects can be created without errors
2. **Application**: Effects apply without producing NaN/Infinity
3. **Semantics**: Flat vs percentage effects work correctly
4. **Behavior**: Critical effect categories have behavioral tests

Run tests with:
```bash
npm test tests/core/effect-system-comprehensive.test.js
```

## Further Reading

- `src/core/ability-effects/base-effect.js` - Base effect implementation
- `src/core/ability-effects/effect-registry.js` - Complete effect registry
- `src/systems/stats-calculator.js` - Stat calculation with effects
- `tests/core/effect-system-comprehensive.test.js` - Comprehensive test suite
