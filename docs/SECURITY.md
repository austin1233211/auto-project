# Security Guidelines

This document outlines the security practices and guidelines for the Auto Gladiators project.

## Overview

Auto Gladiators follows security best practices to protect against common web vulnerabilities and ensure fair gameplay in multiplayer modes. This document covers XSS protection, server-side validation, rate limiting, and memory leak prevention.

## Security Principles

1. **Never trust client input** - All user-generated content must be sanitized
2. **Server-authoritative** - Critical game state is validated server-side
3. **Rate limiting** - Prevent abuse through request throttling
4. **Memory safety** - Proper cleanup to prevent memory leaks
5. **Minimal attack surface** - Only expose necessary endpoints

## XSS (Cross-Site Scripting) Protection

### The Problem

User-generated content (like player names) can contain malicious JavaScript that executes in other players' browsers if not properly sanitized.

**Example Attack:**
```javascript
// Malicious player name
const playerName = '<img src=x onerror="alert(document.cookie)">';

// Unsafe injection
element.innerHTML = `<div>Player: ${playerName}</div>`;
// Result: JavaScript executes in victim's browser
```

### The Solution

Always use the `sanitizeHTML()` utility before injecting user content into the DOM.

**Safe Pattern:**
```javascript
import { sanitizeHTML } from '../src/utils/sanitize.js';

// Sanitize before injection
element.innerHTML = `<div>Player: ${sanitizeHTML(playerName)}</div>`;
// Result: HTML entities are escaped, script cannot execute
```

### Where to Apply Sanitization

Sanitize ALL user-generated content before DOM injection:

1. **Player names** - In multiplayer lobbies, tournament displays, winner announcements
2. **Chat messages** - If chat is implemented
3. **Custom text** - Any user-provided text displayed to other users

### Implementation Checklist

When adding new UI that displays user content:

- [ ] Import `sanitizeHTML` from `src/utils/sanitize.js`
- [ ] Wrap all user-generated variables in `sanitizeHTML()`
- [ ] Test with malicious input (e.g., `<script>alert(1)</script>`)
- [ ] Verify the script does not execute

### Alternative: Use textContent

For simple text nodes, use `textContent` instead of `innerHTML`:

```javascript
// Safe - textContent automatically escapes HTML
element.textContent = playerName;

// Unsafe - innerHTML interprets HTML
element.innerHTML = playerName;
```

## Server-Side Validation

### The Problem

Clients can be modified to send fake battle results, cheat on gold amounts, or manipulate game state.

### The Solution

The server validates all critical game state changes.

### Battle Result Validation

The server validates battle results to detect cheating:

```javascript
// server/server.js
function validateBattleResult(result, match) {
  // 1. Check winner is one of the match participants
  if (result.winnerId !== match.player1.id && 
      result.winnerId !== match.player2.id) {
    logger.warn('[Security] Invalid winner ID');
    return false;
  }
  
  // 2. Check HP loss is within reasonable bounds
  if (result.hpLost < 1 || result.hpLost > 20) {
    logger.warn('[Security] Suspicious HP loss amount');
    return false;
  }
  
  // 3. Check for timing anomalies
  const battleDuration = Date.now() - match.startTime;
  if (battleDuration < 5000) { // Battles should take at least 5 seconds
    logger.warn('[Security] Battle completed too quickly');
    return false;
  }
  
  return true;
}
```

### What to Validate

Server-side validation should cover:

1. **Battle results** - Winner, HP loss, timing
2. **Gold amounts** - Prevent gold manipulation
3. **Hero selection** - Ensure valid hero IDs
4. **Match assignments** - Verify player is in the match
5. **Round progression** - Ensure proper sequencing

## Rate Limiting

### The Problem

Malicious clients can spam requests to overload the server or abuse game mechanics.

### The Solution

Rate limit socket event handlers to prevent abuse.

### Implementation

```javascript
// server/server.js
const rateLimiters = new Map();

function isRateLimited(socketId, action, limit = 5, window = 1000) {
  const key = `${socketId}:${action}`;
  const now = Date.now();
  
  if (!rateLimiters.has(key)) {
    rateLimiters.set(key, []);
  }
  
  const timestamps = rateLimiters.get(key);
  
  // Remove old timestamps outside the window
  const recent = timestamps.filter(t => now - t < window);
  
  if (recent.length >= limit) {
    return true; // Rate limited
  }
  
  recent.push(now);
  rateLimiters.set(key, recent);
  return false;
}

// Apply rate limiting
socket.on('updateName', (name) => {
  if (isRateLimited(socket.id, 'updateName', 3, 5000)) {
    logger.warn(`[Security] Rate limit exceeded for updateName: ${socket.id}`);
    return;
  }
  
  // Process name update
  player.name = sanitizeHTML(name);
});
```

### Rate Limit Guidelines

| Action | Limit | Window | Reason |
|--------|-------|--------|--------|
| updateName | 3 requests | 5 seconds | Prevent name spam |
| confirmRules | 5 requests | 10 seconds | Prevent UI spam |
| clientBattleResult | 1 request | 5 seconds | One result per battle |
| requestMatch | 10 requests | 60 seconds | Prevent matchmaking spam |
| selectHero | 20 requests | 30 seconds | Allow hero browsing |

## Memory Leak Prevention

### The Problem

Event listeners that are not cleaned up cause memory leaks in long-running sessions.

### The Solution

Track and clean up event listeners when components re-render.

### Implementation Pattern

```javascript
class MyComponent {
  constructor() {
    this.eventListeners = [];
  }
  
  render() {
    // Clean up old listeners before re-rendering
    this.cleanup();
    
    // Render new content
    this.container.innerHTML = `<button id="myButton">Click Me</button>`;
    
    // Add new listeners with tracking
    const button = this.container.querySelector('#myButton');
    const listener = () => this.handleClick();
    button.addEventListener('click', listener);
    
    // Track for cleanup
    this.eventListeners.push({
      element: button,
      event: 'click',
      listener: listener
    });
  }
  
  cleanup() {
    // Remove all tracked listeners
    this.eventListeners.forEach(({ element, event, listener }) => {
      element.removeEventListener(event, listener);
    });
    this.eventListeners = [];
  }
  
  destroy() {
    this.cleanup();
    // Additional cleanup (timers, etc.)
  }
}
```

### Alternative: Event Delegation

For dynamic lists, use event delegation to avoid per-element listeners:

```javascript
// Instead of adding listeners to each item
items.forEach(item => {
  item.addEventListener('click', handler); // Memory leak risk
});

// Use event delegation on parent
container.addEventListener('click', (e) => {
  if (e.target.matches('.item')) {
    handler(e);
  }
});
```

### Cleanup Checklist

When creating components that re-render:

- [ ] Track all event listeners in an array
- [ ] Call cleanup before re-rendering with `innerHTML`
- [ ] Clear all timers (setInterval, setTimeout)
- [ ] Dispose of combat instances
- [ ] Remove WebSocket listeners

## Input Validation

### Client-Side Validation

Validate user input on the client for better UX:

```javascript
function validatePlayerName(name) {
  // Length check
  if (name.length < 1 || name.length > 20) {
    return { valid: false, error: 'Name must be 1-20 characters' };
  }
  
  // Character whitelist
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    return { valid: false, error: 'Name can only contain letters, numbers, _ and -' };
  }
  
  return { valid: true };
}
```

### Server-Side Validation

Always validate on the server as well (client validation can be bypassed):

```javascript
socket.on('updateName', (name) => {
  // Rate limiting
  if (isRateLimited(socket.id, 'updateName')) return;
  
  // Type check
  if (typeof name !== 'string') {
    logger.warn('[Security] Invalid name type');
    return;
  }
  
  // Length check
  if (name.length < 1 || name.length > 20) {
    logger.warn('[Security] Invalid name length');
    return;
  }
  
  // Sanitize
  player.name = sanitizeHTML(name.trim());
});
```

## Secure Coding Practices

### 1. Never Log Sensitive Data

```javascript
// Bad
logger.info(`User ${userId} logged in with password ${password}`);

// Good
logger.info(`User ${userId} logged in`);
```

### 2. Use Parameterized Queries (If Using Database)

```javascript
// Bad - SQL injection risk
db.query(`SELECT * FROM users WHERE id = ${userId}`);

// Good - parameterized
db.query('SELECT * FROM users WHERE id = ?', [userId]);
```

### 3. Validate All Socket Events

```javascript
// Bad - no validation
socket.on('someEvent', (data) => {
  processData(data);
});

// Good - validate first
socket.on('someEvent', (data) => {
  if (!isValidData(data)) {
    logger.warn('[Security] Invalid data received');
    return;
  }
  processData(data);
});
```

### 4. Use HTTPS in Production

Always use HTTPS for production deployments to prevent man-in-the-middle attacks.

### 5. Keep Dependencies Updated

Regularly update dependencies to patch security vulnerabilities:

```bash
npm audit
npm audit fix
```

## Security Audit Checklist

When reviewing code for security issues:

### XSS Protection
- [ ] All user-generated content is sanitized before DOM injection
- [ ] `innerHTML` usage is reviewed and safe
- [ ] `textContent` is used where appropriate

### Server-Side Validation
- [ ] Battle results are validated
- [ ] Gold amounts are validated
- [ ] Hero selections are validated
- [ ] Match assignments are validated

### Rate Limiting
- [ ] All socket event handlers have rate limiting
- [ ] Rate limits are appropriate for each action
- [ ] Rate limit violations are logged

### Memory Management
- [ ] Event listeners are tracked and cleaned up
- [ ] Timers are cleared when no longer needed
- [ ] Combat instances are properly disposed
- [ ] WebSocket listeners are removed on disconnect

### Input Validation
- [ ] All user input is validated on client and server
- [ ] Type checks are performed
- [ ] Length limits are enforced
- [ ] Character whitelists are used where appropriate

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** open a public GitHub issue
2. Email the maintainer directly with details
3. Include steps to reproduce
4. Wait for a response before public disclosure

## Security Testing

### Manual Testing

Test for common vulnerabilities:

```javascript
// XSS test payloads
const xssPayloads = [
  '<script>alert(1)</script>',
  '<img src=x onerror="alert(1)">',
  '"><script>alert(1)</script>',
  'javascript:alert(1)',
];

// Test each payload
xssPayloads.forEach(payload => {
  // Try to inject in player name
  // Verify script does not execute
});
```

### Automated Testing

Add security tests to the test suite:

```javascript
// tests/security/xss.test.js
import { sanitizeHTML } from '../src/utils/sanitize.js';

describe('XSS Protection', () => {
  it('should escape script tags', () => {
    const input = '<script>alert(1)</script>';
    const output = sanitizeHTML(input);
    expect(output).not.toContain('<script>');
  });
  
  it('should escape event handlers', () => {
    const input = '<img src=x onerror="alert(1)">';
    const output = sanitizeHTML(input);
    expect(output).not.toContain('onerror');
  });
});
```

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [POST_MERGE_SCAN.md](../POST_MERGE_SCAN.md) - Security audit findings
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guidelines
