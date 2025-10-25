# Testing Infrastructure

This directory contains the test suite for the Auto Gladiators game.

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
tests/
├── setup.js                    # Global test setup
├── core/                       # Core game logic tests
│   └── stats-calculator.test.js
├── shops/                      # Shop system tests
│   └── economy.test.js
└── utils/                      # Utility tests
    └── rng.test.js
```

## Writing Tests

Tests use [Vitest](https://vitest.dev/) with JSDOM for DOM testing.

### Example Test

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { MyClass } from '../../src/my-module.js';

describe('MyClass', () => {
  let instance;

  beforeEach(() => {
    instance = new MyClass();
  });

  it('should do something', () => {
    const result = instance.doSomething();
    expect(result).toBe(expectedValue);
  });
});
```

## Seedable RNG

For deterministic testing of random behavior, use the `RNG` class:

```javascript
import { RNG } from '../../src/utils/rng.js';

const rng = new RNG(12345); // Fixed seed
const value = rng.random(); // Deterministic random value
```

## Coverage

Coverage reports are generated in the `coverage/` directory when running `npm run test:coverage`.

## CI Integration

Tests run automatically on every push and pull request via GitHub Actions. See `.github/workflows/ci.yml` for configuration.
