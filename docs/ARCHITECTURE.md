# Auto Gladiators Architecture

This document describes the high-level architecture, directory structure, and design patterns used in the Auto Gladiators project.

## Overview

Auto Gladiators is a browser-based auto-battler game with both single-player and multiplayer modes. The architecture follows a modular design with clear separation of concerns between client-side game logic, multiplayer coordination, and server-side validation.

## System Architecture

### Client-Server Model

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser (Client)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Game UI (index.html, main.css)                      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Game Logic (src/)                                    │  │
│  │  - Combat System                                      │  │
│  │  - Hero Management                                    │  │
│  │  - Effect System (195+ effects)                       │  │
│  │  - Economy & Shops                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Multiplayer Client (multiplayer/)                    │  │
│  │  - WebSocket Connection                               │  │
│  │  - Tournament UI                                      │  │
│  │  - 1v1 UI                                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ WebSocket (socket.io)
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Node.js Server (server/)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  WebSocket Server (server.js)                        │  │
│  │  - Match Making                                       │  │
│  │  - Tournament Coordination                            │  │
│  │  - Server-Authoritative Game State                    │  │
│  │  - Battle Result Validation                           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Session Manager (session-manager.js)                │  │
│  │  - Player Session Tracking                            │  │
│  │  - Reconnection Handling                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

### `/src` - Client-Side Game Logic

The `src/` directory contains all client-side game logic organized by functionality:

#### `/src/components` - UI Components
- **main.js** - Central orchestrator that initializes the game and coordinates between systems
- **debug-tools.js** - Development tools for testing and debugging
- **dev-test-panel.js** - Testing panel for developers
- **equipment-reward.js** - Equipment selection UI
- **tier3-ability-selector.js** - High-tier ability selection

#### `/src/systems` - Core Game Systems
- **combat.js** - Battle execution engine with simultaneous combat
- **rounds-manager.js** - Tournament orchestration and round progression
- **game-loop.js** - Main game loop coordination
- **minion-combat.js** - PvE battle system
- **timer.js** - Combat timing and speed-based attacks

#### `/src/core` - Core Game Data and Logic
- **heroes.js** - Hero definitions with base stats and abilities
- **abilities.js** - Ability definitions
- **artifacts.js** - Artifact definitions
- **stats-calculator.js** - Stat computation with effect application
- **constants.js** - Game constants
- **game-constants.js** - Configuration values
- **ability-effects/** - Effect system (195+ effects)
  - **base-effect.js** - Abstract base class for all effects
  - **effect-registry.js** - Effect factory and registry
  - **effects/** - Individual effect implementations

#### `/src/shops` - Economy and Shops
- **economy.js** - Currency management and rewards
- **item-shop.js** - Ability purchase system
- **artifacts-shop.js** - Artifact selection system
- **abilities-shop.js** - Base shop class
- **combat-shop-v2.js** - In-combat shop

#### `/src/ui` - UI Components
- **hero-selection.js** - Hero picker interface
- **hero-stats-card.js** - Real-time stats display
- **hero-inventory-widget.js** - Inventory display
- **player-health.js** - HP tracking and display
- **game-mode-selection.js** - Mode picker
- **status-effects-display.js** - Status effect indicators

#### `/src/utils` - Utility Functions
- **sanitize.js** - XSS protection utility
- **logger.js** - Centralized logging system
- **rng.js** - Random number generation
- **performance.js** - Performance monitoring
- **reconnection.js** - Multiplayer reconnection logic

### `/multiplayer` - Multiplayer Client Components

- **multiplayer-client.js** - WebSocket client wrapper
- **multiplayer-tournament.js** - 8-player tournament UI and coordination
- **multiplayer-1v1.js** - 1v1 match UI
- **multiplayer-lobby.js** - Player lobby UI

### `/server` - Node.js Backend

- **server.js** - WebSocket server with game logic
- **session-manager.js** - Session handling and player tracking
- **logger.js** - Server-side logging
- **package.json** - Server dependencies

### `/tests` - Test Suite

- **core/** - Core system tests (effect system, stats calculator)
- **shops/** - Shop system tests
- **systems/** - System tests (rounds lifecycle)
- **utils/** - Utility tests (RNG, performance)
- **e2e/** - End-to-end tests (tournament flow)

## Core Systems

### 1. Combat System

The combat system implements simultaneous auto-combat where both heroes attack based on their individual speed stats.

**Key Features:**
- Speed-based attack timing (not turn-based)
- Mana regeneration system
- Ultimate ability triggers at 100% mana
- Status effects (poison, frost, bleed, shields)
- Real-time UI updates

**Flow:**
1. Combat initialization with hero stats
2. Separate attack timers for each hero based on speed
3. Mana regeneration on each attack
4. Ultimate ability trigger when mana reaches 100%
5. Status effect processing
6. Battle end when one hero reaches 0 HP

### 2. Effect System

The effect system is a registry-driven architecture that manages 195+ unique ability effects.

**Architecture:**
- **BaseEffect** - Abstract base class with `apply(stats)` interface
- **EffectRegistry** - Maps effect names to effect classes
- **createEffect()** - Factory function for effect instantiation

**Effect Categories:**
- Offense (attack, damage, crit)
- Defense (armor, resistance, block)
- Status (poison, frost, bleed, stun)
- Resource (health, mana, shield, gold)
- Conditional (low HP, kill bonuses, crit bonuses)
- Aura (area effects)
- Stacking (cumulative effects)
- Ultimate (hero ultimate abilities)

See [EFFECT_SYSTEM_GUIDE.md](EFFECT_SYSTEM_GUIDE.md) for detailed documentation.

### 3. Tournament System

The tournament system manages both single-player and multiplayer game modes.

**Single-Player:**
- Player vs AI opponents
- Round-based progression
- Economy and shop phases between rounds
- Artifact and equipment selection rounds

**Multiplayer (1v1):**
- Player vs player matches
- Hero selection phase
- Rules confirmation
- Server-authoritative battle results

**Multiplayer (8-Player Tournament):**
- 8 players compete in bracket-style tournament
- Simultaneous matches each round
- Server-authoritative round timer
- Background match simulation
- Elimination system with ghost players

### 4. Economy System

The economy system manages gold rewards and spending.

**Features:**
- Round-based gold rewards
- Victory bonuses
- Loss streak bonuses (catch-up mechanic)
- Shop purchases (abilities, artifacts, equipment)
- Gold display and tracking

### 5. Multiplayer Coordination

The multiplayer system uses WebSocket (socket.io) for real-time communication.

**Server-Side:**
- Match making (1v1 pairing, 8-player grouping)
- Server-authoritative game state
- Global round timer for tournaments
- Battle result validation
- Reconnection handling

**Client-Side:**
- WebSocket connection management
- UI updates based on server events
- Battle result reporting
- Reconnection logic

## Design Patterns

### 1. Registry Pattern (Effect System)

The effect system uses a registry pattern to map effect names to effect classes, enabling dynamic effect instantiation.

```javascript
export const EffectRegistry = {
  'attack_boost': AttackBoostEffect,
  'health_boost': HealthBoostEffect,
  // ... 195+ more effects
};

export function createEffect(ability) {
  const EffectClass = EffectRegistry[ability.effect];
  return new EffectClass(ability.value);
}
```

### 2. Observer Pattern (Event System)

Components use event listeners to react to game state changes.

```javascript
// Event listener tracking for cleanup
this.eventListeners = [];

// Add listener with tracking
const listener = () => { /* handler */ };
element.addEventListener('click', listener);
this.eventListeners.push({ element, event: 'click', listener });

// Cleanup
this.eventListeners.forEach(({ element, event, listener }) => {
  element.removeEventListener(event, listener);
});
```

### 3. Factory Pattern (Hero/Ability Creation)

Heroes and abilities are created using factory functions that return configured objects.

```javascript
export const heroes = [
  {
    id: 'warrior',
    name: 'Warrior',
    baseStats: { health: 1000, attack: 50, armor: 10, speed: 100 },
    abilities: [/* ability definitions */]
  },
  // ... more heroes
];
```

### 4. Module Pattern (ES6 Modules)

All code is organized into ES6 modules with clear imports/exports.

```javascript
// Export
export class Combat { /* ... */ }
export function calculateDamage() { /* ... */ }

// Import
import { Combat } from './systems/combat.js';
import { calculateDamage } from './utils/damage.js';
```

## Data Flow

### Single-Player Game Flow

```
1. Game Mode Selection
   ↓
2. Hero Selection
   ↓
3. Round Start
   ↓
4. Combat Phase
   ↓
5. Round End (Gold Reward)
   ↓
6. Shop Phase (Ability Purchase)
   ↓
7. Special Rounds (Artifacts/Equipment)
   ↓
8. Repeat from step 3 until elimination
```

### Multiplayer Tournament Flow

```
1. Join Waiting Room (8 players)
   ↓
2. Hero Selection (all players)
   ↓
3. Server Creates Matches (4 matches)
   ↓
4. Pre-Round Buffer (30 seconds)
   ↓
5. Combat Phase (all matches simultaneous)
   ↓
6. Round Complete (server validates results)
   ↓
7. Update Player HP and Gold
   ↓
8. Eliminate Players with 0 HP
   ↓
9. Repeat from step 3 until 1 winner remains
```

## Security Architecture

### XSS Protection

All user-generated content is sanitized before DOM injection using the `sanitizeHTML()` utility.

```javascript
import { sanitizeHTML } from '../src/utils/sanitize.js';

// Sanitize player names before display
element.innerHTML = `<div>${sanitizeHTML(player.name)}</div>`;
```

### Server-Side Validation

Battle results are validated server-side to prevent cheating.

```javascript
// Server validates battle results
function validateBattleResult(result, match) {
  // Check winner is valid
  // Check HP loss is reasonable
  // Detect suspicious patterns
  return isValid;
}
```

### Rate Limiting

Socket event handlers are rate-limited to prevent abuse.

```javascript
// Rate limit player name updates
const rateLimiter = new Map();
socket.on('updateName', (name) => {
  if (isRateLimited(socket.id)) return;
  // Process name update
});
```

### Event Listener Cleanup

Components track and clean up event listeners to prevent memory leaks.

```javascript
// Track listeners
this.eventListeners = [];

// Clean up before re-render
this.eventListeners.forEach(({ element, event, listener }) => {
  element.removeEventListener(event, listener);
});
this.eventListeners = [];
```

## Performance Considerations

### Effect System Optimization

- Effects are instantiated once and cached
- Stat calculations are batched
- Effect application is optimized for common cases

### Combat System Optimization

- Separate timers for each hero (no polling)
- UI updates are throttled
- Status effects are processed efficiently

### Memory Management

- Event listeners are cleaned up when components re-render
- Timers are cleared when battles end
- Combat instances are properly disposed

## Testing Strategy

### Unit Tests

- Core systems (combat, stats calculator, effect system)
- Utility functions (RNG, sanitization, logging)
- Shop systems (economy, purchases)

### Integration Tests

- Round lifecycle
- Tournament flow
- Multiplayer coordination

### End-to-End Tests

- Full tournament flow
- Multiplayer scenarios
- Reconnection handling

## Deployment Architecture

### Docker Container

```
┌─────────────────────────────────────────┐
│         Docker Container                 │
│  ┌────────────────────────────────────┐ │
│  │  Nginx (Port 8080)                 │ │
│  │  - Serves static files             │ │
│  │  - Proxies /socket.io/ to Node.js │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Node.js Server (Port 3001)        │ │
│  │  - WebSocket server                │ │
│  │  - Game logic                      │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Static Hosting (Single-Player)

For single-player mode, only static files are needed:
- index.html
- main.css
- src/ directory
- No server required

## Future Architecture Considerations

### Planned Improvements

1. **Effect System Organization**
   - Categorize 195+ effects into subdirectories
   - Create barrel exports for cleaner imports
   - Add effect category metadata

2. **Event Listener Management**
   - Create EventCollector utility
   - Standardize cleanup patterns across all components

3. **Logging Consistency**
   - Convert all console.* calls to logger utility
   - Add configurable log levels

4. **Input Validation**
   - Add validation to all socket event handlers
   - Expand rate limiting coverage

5. **Sects/Factions System**
   - Hero faction bonuses
   - Faction-specific abilities
   - Faction synergies

## References

- [EFFECT_SYSTEM_GUIDE.md](EFFECT_SYSTEM_GUIDE.md) - Detailed effect system documentation
- [SECURITY.md](SECURITY.md) - Security practices and guidelines
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guidelines
- [POST_MERGE_SCAN.md](../POST_MERGE_SCAN.md) - Security audit findings
