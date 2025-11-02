# Auto Gladiators

A standalone auto-battler game inspired by Dota 2's Auto Gladiators arcade mode. Built incrementally with modular components for easy development and maintenance.

## 🎮 Live Demo

**Hero Selection Component:** https://dota-gladius-app-l00kly3e.devinapps.com

## 📋 Project Overview

Auto Gladiators is a browser-based auto-battler featuring both single-player and multiplayer modes. Players select heroes, participate in automated combat rounds, earn currency, and purchase upgrades between rounds.

### ✅ Completed Features
- **Hero Selection** - Choose from 6 unique heroes with different stats and abilities
- **Combat System** - Simultaneous auto-combat with mana, abilities, crit/evasion, and status effects
- **Tournament/Rounds Manager** - Simultaneous matches with background simulation and inter-round buffer
- **Player Health System** - Global HP with loss streak logic and elimination
- **Economy System** - Round rewards and shop spending
- **Combat Shop** - Purchase abilities during combat
- **Artifacts & Equipment Rewards** - Special rounds with selections that modify stats
- **Hero Stats Card** - Live-updating hero stats display with status effects
- **Minion Rounds** - Special PvE rounds
- **Multiplayer Modes** - 1v1 duels and 8-player tournaments
- **Effect System** - 195+ unique ability effects with registry-driven architecture

### 🚧 Planned Features
- Sects/Factions - Hero factions with unique bonuses
- Additional abilities/items/artifacts and balance improvements
- Audio/visual polish and UX refinements

## 🏗️ Architecture

The project uses a modular file structure organized by functionality:

```
auto-project/
├── index.html                      # Main entry point
├── main.css                        # Global styles
├── src/                            # Client-side game logic
│   ├── components/                 # UI components
│   │   ├── main.js                # Central orchestrator
│   │   ├── debug-tools.js         # Development tools
│   │   ├── dev-test-panel.js      # Testing panel
│   │   ├── equipment-reward.js    # Equipment selection
│   │   └── tier3-ability-selector.js
│   ├── systems/                    # Core game systems
│   │   ├── combat.js              # Battle execution
│   │   ├── rounds-manager.js      # Tournament orchestration
│   │   ├── game-loop.js           # Main game loop
│   │   ├── minion-combat.js       # PvE battles
│   │   └── timer.js               # Combat timing
│   ├── core/                       # Core game data and logic
│   │   ├── heroes.js              # Hero definitions
│   │   ├── abilities.js           # Ability definitions
│   │   ├── artifacts.js           # Artifact definitions
│   │   ├── stats-calculator.js    # Stat computation
│   │   ├── constants.js           # Game constants
│   │   ├── game-constants.js      # Configuration values
│   │   └── ability-effects/       # Effect system (195+ effects)
│   │       ├── base-effect.js     # Abstract base class
│   │       ├── effect-registry.js # Effect factory
│   │       └── effects/           # Individual effect implementations
│   ├── shops/                      # Economy and shops
│   │   ├── economy.js             # Currency management
│   │   ├── item-shop.js           # Ability purchases
│   │   ├── artifacts-shop.js      # Artifact selection
│   │   ├── abilities-shop.js      # Base shop class
│   │   └── combat-shop-v2.js      # In-combat shop
│   ├── ui/                         # UI components
│   │   ├── hero-selection.js      # Hero picker
│   │   ├── hero-stats-card.js     # Stats display
│   │   ├── hero-inventory-widget.js
│   │   ├── player-health.js       # HP tracking
│   │   ├── game-mode-selection.js # Mode picker
│   │   └── status-effects-display.js
│   └── utils/                      # Utility functions
│       ├── sanitize.js            # XSS protection
│       ├── logger.js              # Logging utility
│       ├── rng.js                 # Random number generation
│       ├── performance.js         # Performance monitoring
│       └── reconnection.js        # Multiplayer reconnection
├── multiplayer/                    # Multiplayer client components
│   ├── multiplayer-client.js      # WebSocket client
│   ├── multiplayer-tournament.js  # 8-player tournament UI
│   ├── multiplayer-1v1.js         # 1v1 match UI
│   └── multiplayer-lobby.js       # Player lobby UI
├── server/                         # Node.js backend
│   ├── server.js                  # WebSocket server & game logic
│   ├── session-manager.js         # Session handling
│   ├── logger.js                  # Server logging
│   └── package.json               # Server dependencies
├── tests/                          # Test suite
│   ├── core/                      # Core system tests
│   ├── shops/                     # Shop tests
│   ├── systems/                   # System tests
│   ├── utils/                     # Utility tests
│   ├── e2e/                       # End-to-end tests
│   └── README.md                  # Testing documentation
├── docs/                           # Documentation
│   └── EFFECT_SYSTEM_GUIDE.md     # Effect system documentation
└── POST_MERGE_SCAN.md             # Security audit findings
```

For detailed architecture documentation, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 🦸 Heroes

The game features 6 unique heroes across 3 attribute types:

### Strength Heroes
- **Warrior** ⚔️ - High health and armor, melee fighter
- **Paladin** 🛡️ - Balanced offense/defense with healing

### Intelligence Heroes  
- **Mage** 🔮 - High damage spellcaster, fragile
- **Necromancer** 💀 - Life drain and undead summoning

### Agility Heroes
- **Archer** 🏹 - Ranged attacker with high mobility
- **Assassin** 🗡️ - Stealth and critical strikes

Each hero has unique:
- Base stats (Health, Attack, Armor, Speed)
- 3 special abilities
- Attribute type bonuses

## 🎯 Game Mechanics

### Combat System
- **Automated simultaneous combat** - Not turn-based; both heroes attack based on their speed
- **Mana system** - Regenerates during combat, triggers ultimate ability at 100%
- **Status effects** - Poison, frost, bleed, shields, and more
- **Real-time UI updates** - Health, mana, and status effects display during combat
- **Damage calculations** - Armor/resistance, critical hits, evasion

### Progression System
- **Gold economy** - Earn gold from victories, spend on upgrades
- **Ability shop** - Purchase new abilities between rounds
- **Artifact selection** - Choose powerful artifacts on special rounds
- **Equipment rewards** - Gain stat-boosting equipment
- **Loss streak bonuses** - Catch-up mechanics for losing players

### Multiplayer Modes
- **1v1 Duels** - Head-to-head matches against another player
- **8-Player Tournaments** - Compete in bracket-style tournaments
- **Server-authoritative** - Prevents cheating with server-side validation
- **Reconnection support** - Rejoin matches if disconnected

## 🛠️ Development Setup

### Prerequisites
- Modern web browser with ES6 module support
- Node.js 18+ (for testing and development)
- Local web server (Python, Node.js, or any HTTP server)

### Running Locally (Single-Player)

```bash
# Clone the repository
git clone https://github.com/austin1233211/auto-project.git
cd auto-project

# Install dependencies
npm install

# Start a local web server
npx serve .
# OR
python3 -m http.server 8080

# Open browser to http://localhost:8080
```

### Running Multiplayer

**Start the server:**
```bash
cd server
npm install
npm start
# Server runs on port 3001
```

**Start the client:**
```bash
# From repo root
npx serve .
# OR
python3 -m http.server 8080

# Open browser to http://localhost:8080
# Select "Multiplayer 1v1" or "Multiplayer Tournament"
```

**Configuration:**
- To use a different server URL, set `window.GAME_SERVER_URL` in browser console before entering multiplayer mode
- Default: `http://localhost:3001`

### Testing

The project includes a comprehensive test suite using Vitest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

See [tests/README.md](tests/README.md) for more details on writing and running tests.

## 📱 Responsive Design

The game is built with mobile-first responsive design:

- **Mobile (< 768px)**: Compact layout, touch-friendly controls
- **Tablet (768px - 1024px)**: Enhanced spacing and larger elements  
- **Desktop (> 1024px)**: Full-featured layout with maximum screen usage

## 🚀 Deployment

### Docker Deployment

The entire game can be run in a single Docker container:

```bash
# Build the container
docker build -t auto-gladiators .

# Run locally
docker run -p 8080:8080 auto-gladiators

# Or use docker-compose
docker-compose up
```

The container includes:
- Nginx serving static client files on port 8080
- Node.js server handling WebSocket connections on port 3001
- Automatic health checks and process management

### Static Hosting (Single-Player Only)

For single-player mode, deploy the static files to any hosting service:

```bash
# Deploy to GitHub Pages, Netlify, Vercel, etc.
# Just upload: index.html, main.css, src/, multiplayer/ (optional)
```

### Railway/Heroku Deployment

The project includes configuration for Railway and Heroku:

```bash
# Railway
npm run railway:build
npm run railway:start

# Heroku
# Uses Procfile for deployment
```

## 🔒 Security

This project follows security best practices:

- **XSS Protection** - All user-generated content is sanitized using `sanitizeHTML()`
- **Server-side validation** - Battle results are validated server-side to prevent cheating
- **Rate limiting** - Socket event handlers are rate-limited to prevent abuse
- **Event listener cleanup** - Proper cleanup to prevent memory leaks

For more details, see [docs/SECURITY.md](docs/SECURITY.md).

## 🤝 Contributing

This project is built incrementally. When adding new features:

1. Create separate files for each major system
2. Follow the existing code style and patterns
3. Maintain mobile responsiveness
4. Write tests for new features
5. Use the logger utility instead of console.*
6. Sanitize all user-generated content before DOM injection
7. Clean up event listeners when components re-render

For detailed guidelines, see [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).

## 📚 Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture and design patterns
- [EFFECT_SYSTEM_GUIDE.md](docs/EFFECT_SYSTEM_GUIDE.md) - How to add and modify ability effects
- [SECURITY.md](docs/SECURITY.md) - Security practices and guidelines
- [CONTRIBUTING.md](docs/CONTRIBUTING.md) - Development guidelines
- [POST_MERGE_SCAN.md](POST_MERGE_SCAN.md) - Security audit findings

## 🎨 Design Philosophy

- **Incremental Development** - Build one component at a time
- **Modular Architecture** - Each system is independent and reusable
- **Mobile-First** - Ensure great experience on all devices
- **Performance** - Lightweight and fast loading
- **Security** - XSS protection and server-side validation
- **Testability** - Comprehensive test coverage for core systems

## 📄 License

This project is open source and available under the MIT License.

---

**Current Status**: Fully functional single-player and multiplayer auto-battler with 195+ ability effects  
**Next Focus**: Content expansion (abilities/items/artifacts), Sects/Factions, audio/visual polish  
**Live Demo**: https://dota-gladius-app-l00kly3e.devinapps.com

---
*Last updated: November 2, 2025*
