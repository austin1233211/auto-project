# Contributing to Auto Gladiators

Thank you for your interest in contributing to Auto Gladiators! This document provides guidelines and best practices for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Adding New Features](#adding-new-features)
- [Testing Guidelines](#testing-guidelines)
- [Security Guidelines](#security-guidelines)
- [Pull Request Process](#pull-request-process)

## Getting Started

### Prerequisites

- Node.js 18+ 
- Modern web browser with ES6 module support
- Git
- Text editor or IDE (VS Code recommended)

### Setup

```bash
# Clone the repository
git clone https://github.com/austin1233211/auto-project.git
cd auto-project

# Install dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Start development server
npx serve .
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## Development Workflow

### 1. Create a Branch

```bash
# Create a new branch for your feature
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write code following the style guidelines below
- Add tests for new functionality
- Update documentation as needed
- Run tests and linter before committing

### 3. Commit Changes

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "Add feature: description of what you added"
```

### 4. Push and Create PR

```bash
# Push to your branch
git push origin feature/your-feature-name

# Create a pull request on GitHub
```

## Code Style Guidelines

### General Principles

1. **Modular Design** - Each file should have a single, clear responsibility
2. **ES6 Modules** - Use import/export for all module dependencies
3. **Mobile-First** - Design for mobile, enhance for desktop
4. **Security-First** - Sanitize all user input, validate on server
5. **Test Coverage** - Write tests for new features

### JavaScript Style

#### Use ES6+ Features

```javascript
// Good - ES6 class
export class Combat {
  constructor(container) {
    this.container = container;
  }
}

// Good - Arrow functions
const processResults = (results) => {
  return results.map(r => r.score);
};

// Good - Destructuring
const { health, attack, armor } = hero.stats;

// Good - Template literals
const message = `Player ${player.name} won with ${score} points`;
```

#### Naming Conventions

```javascript
// Classes: PascalCase
class HeroStatsCard { }

// Functions and variables: camelCase
function calculateDamage() { }
const playerHealth = 100;

// Constants: UPPER_SNAKE_CASE
const MAX_PLAYERS = 8;
const DEFAULT_GOLD = 100;

// Private properties: prefix with underscore
class Player {
  constructor() {
    this._internalState = {};
  }
}

// File names: kebab-case
// hero-selection.js
// multiplayer-tournament.js
```

#### Code Organization

```javascript
// 1. Imports at top
import { heroes } from '../core/heroes.js';
import { Combat } from '../systems/combat.js';

// 2. Constants
const MAX_ROUNDS = 10;
const GOLD_PER_WIN = 50;

// 3. Class or function definitions
export class RoundsManager {
  constructor() {
    // ...
  }
  
  // Public methods first
  startRound() {
    // ...
  }
  
  // Private methods last
  _processResults() {
    // ...
  }
}

// 4. Exports at bottom (if not inline)
export { RoundsManager };
```

### No Comments Unless Necessary

Do not add comments to code unless explicitly needed for complex logic. Write self-documenting code with clear variable and function names.

```javascript
// Bad - unnecessary comment
// Calculate the damage
const damage = attack - armor;

// Good - self-documenting
const damageAfterArmor = attack - armor;

// Good - comment for complex logic
// Apply diminishing returns: armor effectiveness decreases above 50
const effectiveArmor = armor > 50 
  ? 50 + (armor - 50) * 0.6 
  : armor;
```

### Use Logger Instead of Console

Always use the logger utility instead of console.* calls:

```javascript
// Bad
console.log('Player joined:', player.name);
console.error('Battle failed:', error);

// Good
import { logger } from '../utils/logger.js';

logger.debug('Player joined:', player.name);
logger.error('Battle failed:', error);
```

### Sanitize User Input

Always sanitize user-generated content before DOM injection:

```javascript
// Bad - XSS vulnerability
element.innerHTML = `<div>${player.name}</div>`;

// Good - sanitized
import { sanitizeHTML } from '../utils/sanitize.js';
element.innerHTML = `<div>${sanitizeHTML(player.name)}</div>`;

// Better - use textContent for simple text
element.textContent = player.name;
```

### Clean Up Event Listeners

Track and clean up event listeners to prevent memory leaks:

```javascript
class MyComponent {
  constructor() {
    this.eventListeners = [];
  }
  
  render() {
    // Clean up before re-rendering
    this.cleanup();
    
    // Render new content
    this.container.innerHTML = `<button id="btn">Click</button>`;
    
    // Add listener with tracking
    const button = this.container.querySelector('#btn');
    const listener = () => this.handleClick();
    button.addEventListener('click', listener);
    
    this.eventListeners.push({ element: button, event: 'click', listener });
  }
  
  cleanup() {
    this.eventListeners.forEach(({ element, event, listener }) => {
      element.removeEventListener(event, listener);
    });
    this.eventListeners = [];
  }
}
```

### Mobile-First CSS

Write CSS mobile-first, then enhance for larger screens:

```css
/* Mobile-first base styles */
.game-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
  gap: 2px;
  max-width: min(90vw, 400px);
}

/* Tablet enhancements */
@media (min-width: 768px) {
  .game-board {
    max-width: min(85vw, 600px);
    gap: 3px;
  }
}

/* Desktop enhancements */
@media (min-width: 1024px) {
  .game-board {
    max-width: min(80vw, 800px);
    gap: 4px;
  }
}
```

## Adding New Features

### Adding a New Hero

1. Add hero definition to `src/core/heroes.js`:

```javascript
export const heroes = [
  // ... existing heroes
  {
    id: 'new-hero',
    name: 'New Hero',
    avatar: '🦸',
    attribute: 'strength', // or 'intelligence', 'agility'
    baseStats: {
      health: 1000,
      attack: 50,
      armor: 10,
      speed: 100,
      mana: 100,
      manaRegen: 10
    },
    abilities: [
      // Add abilities here
    ]
  }
];
```

2. Add hero artwork/assets if needed
3. Test hero in single-player mode
4. Test hero in multiplayer mode
5. Add tests for hero-specific mechanics

### Adding a New Ability Effect

See [EFFECT_SYSTEM_GUIDE.md](EFFECT_SYSTEM_GUIDE.md) for detailed instructions.

Quick summary:

1. Create effect class in `src/core/ability-effects/effects/`:

```javascript
import { BaseEffect } from '../base-effect.js';

export class MyNewEffect extends BaseEffect {
  apply(stats) {
    stats.myNewStat = (stats.myNewStat || 0) + this.value;
  }
}
```

2. Register in `src/core/ability-effects/effect-registry.js`:

```javascript
import { MyNewEffect } from './effects/my-new-effect.js';

export const EffectRegistry = {
  // ... existing effects
  'my_new_effect': MyNewEffect,
};
```

3. Add tests in `tests/core/effect-system-comprehensive.test.js`

4. Use in hero abilities in `src/core/abilities.js`

### Adding a New UI Component

1. Create component file in appropriate directory:
   - `src/components/` for game components
   - `src/ui/` for UI widgets
   - `multiplayer/` for multiplayer-specific UI

2. Follow the component pattern:

```javascript
export class MyComponent {
  constructor(container) {
    this.container = container;
    this.eventListeners = [];
  }
  
  init() {
    this.render();
  }
  
  render() {
    this.cleanup();
    
    this.container.innerHTML = `
      <div class="my-component">
        <!-- Component HTML -->
      </div>
    `;
    
    this.attachEvents();
  }
  
  attachEvents() {
    // Add event listeners with tracking
  }
  
  cleanup() {
    // Remove event listeners
    this.eventListeners.forEach(({ element, event, listener }) => {
      element.removeEventListener(event, listener);
    });
    this.eventListeners = [];
  }
  
  destroy() {
    this.cleanup();
    // Additional cleanup
  }
}
```

3. Add CSS in `main.css` or component-specific CSS file

4. Import and use in `src/components/main.js` or appropriate parent

5. Add tests for component functionality

### Adding a New Game Mode

1. Add mode selection in `src/ui/game-mode-selection.js`

2. Create mode-specific logic file in `src/systems/`

3. Update `src/components/main.js` to handle new mode

4. Add multiplayer support if needed in `server/server.js`

5. Add tests for new mode

6. Update documentation

## Testing Guidelines

### Unit Tests

Write unit tests for:
- Core game logic (combat, stats, effects)
- Utility functions
- Shop systems
- Economy calculations

```javascript
// tests/core/my-feature.test.js
import { describe, it, expect } from 'vitest';
import { myFunction } from '../src/core/my-feature.js';

describe('MyFeature', () => {
  it('should do something correctly', () => {
    const result = myFunction(input);
    expect(result).toBe(expectedOutput);
  });
  
  it('should handle edge cases', () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

### Integration Tests

Write integration tests for:
- Round lifecycle
- Tournament flow
- Shop interactions
- Combat sequences

### End-to-End Tests

Write E2E tests for:
- Full game flows
- Multiplayer scenarios
- UI interactions

```javascript
// tests/e2e/my-flow.spec.js
import { test, expect } from '@playwright/test';

test('complete tournament flow', async ({ page }) => {
  await page.goto('http://localhost:8080');
  
  // Test steps
  await page.click('#start-button');
  await page.click('#hero-warrior');
  // ... more steps
  
  // Assertions
  await expect(page.locator('#victory-screen')).toBeVisible();
});
```

### Test Coverage

Aim for:
- 70%+ coverage for core systems
- 80%+ coverage for effect system
- 65%+ coverage for game systems

Run coverage report:
```bash
npm run test:coverage
```

## Security Guidelines

See [SECURITY.md](SECURITY.md) for detailed security guidelines.

Key points:
- **Always sanitize user input** before DOM injection
- **Validate on server** - never trust client data
- **Rate limit** socket event handlers
- **Clean up** event listeners to prevent memory leaks
- **Use HTTPS** in production

## Pull Request Process

### Before Submitting

1. **Run tests** - Ensure all tests pass
   ```bash
   npm test
   ```

2. **Run linter** - Fix all linting issues
   ```bash
   npm run lint:fix
   ```

3. **Test manually** - Test your changes in the browser

4. **Update documentation** - Update README.md and other docs as needed

5. **Write clear commit messages**
   ```
   Add feature: hero ultimate abilities
   
   - Implement ultimate ability trigger at 100% mana
   - Add visual effects for ultimate activation
   - Update hero stats card to show ultimate cooldown
   ```

### PR Description

Include in your PR description:
- **What** - What does this PR do?
- **Why** - Why is this change needed?
- **How** - How does it work?
- **Testing** - How did you test it?
- **Screenshots** - For UI changes, include before/after screenshots

### PR Review Process

1. **Automated checks** - CI will run tests and linter
2. **Code review** - Maintainer will review your code
3. **Feedback** - Address any requested changes
4. **Approval** - PR will be merged when approved

### After Merge

- Your changes will be deployed automatically
- Monitor for any issues
- Respond to any bug reports

## Common Pitfalls to Avoid

### 1. Not Cleaning Up Event Listeners

```javascript
// Bad - memory leak
render() {
  this.container.innerHTML = `<button id="btn">Click</button>`;
  document.querySelector('#btn').addEventListener('click', handler);
  // Old listeners are not removed!
}

// Good - tracked and cleaned up
render() {
  this.cleanup(); // Remove old listeners first
  this.container.innerHTML = `<button id="btn">Click</button>`;
  const button = document.querySelector('#btn');
  const listener = () => handler();
  button.addEventListener('click', listener);
  this.eventListeners.push({ element: button, event: 'click', listener });
}
```

### 2. Not Sanitizing User Input

```javascript
// Bad - XSS vulnerability
element.innerHTML = `<div>${player.name}</div>`;

// Good - sanitized
element.innerHTML = `<div>${sanitizeHTML(player.name)}</div>`;
```

### 3. Using Console Instead of Logger

```javascript
// Bad
console.log('Debug info');

// Good
logger.debug('Debug info');
```

### 4. Not Testing on Mobile

Always test your changes on mobile devices or browser dev tools mobile emulation.

### 5. Hardcoding Values

```javascript
// Bad
if (players.length === 8) { /* ... */ }

// Good
const MAX_TOURNAMENT_PLAYERS = 8;
if (players.length === MAX_TOURNAMENT_PLAYERS) { /* ... */ }
```

### 6. Not Handling Edge Cases

```javascript
// Bad - crashes on null
const name = player.name.toUpperCase();

// Good - handles null/undefined
const name = player?.name?.toUpperCase() || 'Unknown';
```

## Getting Help

- **Documentation** - Check [ARCHITECTURE.md](ARCHITECTURE.md) and [EFFECT_SYSTEM_GUIDE.md](EFFECT_SYSTEM_GUIDE.md)
- **Issues** - Search existing GitHub issues
- **Questions** - Open a GitHub discussion
- **Security** - Email maintainer directly (do not open public issue)

## Code of Conduct

- Be respectful and constructive
- Welcome newcomers
- Focus on what is best for the project
- Show empathy towards other contributors

## License

By contributing to Auto Gladiators, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Auto Gladiators! 🎮
