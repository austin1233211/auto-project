# Auto Gladiators

A standalone auto-battler game inspired by Dota 2's Auto Gladiators arcade mode. Built incrementally with modular components for easy development and maintenance.

## 🎮 Live Demo

**Hero Selection Component:** https://dota-gladius-app-l00kly3e.devinapps.com

## 📋 Project Overview

Auto Gladiators is being built piece by piece with the following planned components:

### ✅ Completed Components
- Hero Selection - Choose from 6 unique heroes with different stats and abilities
- Combat System - Simultaneous auto-combat with mana, abilities, crit/evasion, and status effects
- Tournament/Rounds Manager - Simultaneous matches with background simulation and inter-round buffer
- Player Health System - Global HP with loss streak logic and elimination
- Economy/Money System - Round rewards and shop spending
- Combat Shop - Purchase abilities during combat
- Artifacts & Equipment Rewards - Special rounds with selections that modify stats
- Hero Stats Card - Live-updating hero stats display
- Minion Rounds - Special PvE rounds

### 🚧 Planned Components
- Sects/Factions - Hero factions with unique bonuses
- Additional abilities/items/artifacts and balance
- Multiplayer backend integration
- Audio/visual polish and UX refinements

## 🏗️ Architecture

The project uses a modular file structure with separate components:

```
auto-project/
├── index.html
├── main.css
├── main.js
├── game-mode-selection.js
├── hero-selection.js
├── rounds-manager.js
├── combat.js
├── abilities.js
├── stats-calculator.js
├── player-health.js
├── hero-stats-card.js
├── economy.js
├── combat-shop-v2.js
├── artifacts.js
├── artifacts-shop.js
├── equipment-reward.js
├── minion-combat.js
├── timer.js
├── debug-tools.js
└── heroes.js
```

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

## 🎯 Game Mechanics (Planned)

### Combat System
- Automated 1v1 simultaneous combat (not turn-based)
- Separate timers for each hero’s attacks based on speed
- Mana system with regeneration and automatic ultimate trigger at full mana
- Status effects processing and real-time health/mana UI updates
- Damage calculations with armor/resistance, crit and evasion

### Progression System
- Earn points from victories
- Spend points on upgrades between rounds
- Ability upgrades (damage, cooldown, effects)
- Item purchases (stat bonuses, special effects)
- Relic system (permanent upgrades)

### Economy
- Point wagering system
- Risk/reward mechanics
- Tournament entry fees
- Prize distribution

## 🛠️ Development Setup

### Prerequisites
- Modern web browser with ES6 module support
- Node.js 18+ (for testing and development)
- Local web server (Python, Node.js, or any HTTP server)

### Running Locally
```bash
# Clone the repository
git clone <repository-url>
cd auto-gladiators

# Install dependencies
npm install

# Start a local web server
python3 -m http.server 8080
# OR
npx serve .
# OR
php -S localhost:8080

# Open browser to http://localhost:8080
```

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

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

See [tests/README.md](tests/README.md) for more details on writing and running tests.

### File Structure Guidelines
- Keep components modular and separate
- Use ES6 modules for imports/exports
- Mobile-first responsive design
- Maintain consistent code style
- Write tests for new features

## 📱 Responsive Design

The game is built with mobile-first responsive design:

- **Mobile (< 768px)**: Compact layout, touch-friendly controls
- **Tablet (768px - 1024px)**: Enhanced spacing and larger elements  
- **Desktop (> 1024px)**: Full-featured layout with maximum screen usage

## 🚀 Deployment

### Multiplayer (1v1) Setup

Server:
- cd server
- npm install
- npm start

Client:
- From repo root, serve the static files:
  - npx serve . (or) python3 -m http.server 8080
- Open two browser tabs to the served URL
- Select Multiplayer mode, pick a hero in both tabs, click Ready
- Battle will start when both players are ready

Config:
- To point to a different server URL, set window.GAME_SERVER_URL in the browser console before entering Multiplayer.

The project is deployment-ready with a build system:

```bash
# Create build directory
mkdir build
cp index.html build/
cp -r js styles data build/

# Deploy build/ directory to any static hosting service
```

### Multiplayer Tournament (8 players)

Server:
- cd server
- npm install
- npm start

Client:
- Serve the repo root (for example: `npx serve .` or `python3 -m http.server 8080`)
- Open 8 tabs to the served URL
- Choose "Multiplayer Tournament", optionally enter a name, pick a hero, click Ready in each tab
- When all 8 are ready, the server starts buffer → round; each tab receives a match assignment
- Play your battle; results sync; round advances when all matches complete or the round timer expires
- The tournament continues until one winner remains

Notes:
- Global timer is server-authoritative and only ends a round when all matches are resolved
- Artifacts/minion rounds are simplified in the tournament MVP
- Single-player remains unchanged

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

## 🔄 Development Roadmap

### Phase 1: Foundation ✅
- [x] Hero selection interface
- [x] Responsive design system
- [x] Modular architecture

### Phase 2: Core Gameplay 🚧
- [ ] Combat system implementation
- [ ] Basic AI opponent
- [ ] Victory/defeat conditions

### Phase 3: Progression 🚧
- [ ] Shop/upgrade interface
- [ ] Ability upgrade system
- [ ] Item system

### Phase 4: Advanced Features 🚧
- [ ] Relic system
- [ ] Sects/faction bonuses
- [ ] Tournament mode

### Phase 5: Polish 🚧
- [ ] Sound effects and music
- [ ] Animations and visual effects
- [ ] Balancing and optimization

## 🎨 Design Philosophy

- **Incremental Development**: Build one component at a time
- **Modular Architecture**: Each system is independent and reusable
- **Mobile-First**: Ensure great experience on all devices
- **Performance**: Lightweight and fast loading
- **Accessibility**: Clear UI and responsive controls

## 🤝 Contributing

This project is built incrementally. When adding new components:

1. Create separate files for each major system
2. Follow the existing code style and patterns
3. Maintain mobile responsiveness
4. Test on multiple screen sizes
5. Update this README with new features

## 📄 License

This project is open source and available under the MIT License.

---

**Current Status**: Hero Selection, Combat, Tournament/Rounds, Shops, Economy, Player Health, Hero Stats Card implemented
**Next Focus**: Content expansion (abilities/items/artifacts), Sects/Factions, polish and multiplayer groundwork
**Live Demo**: https://dota-gladius-app-l00kly3e.devinapps.com

---
*Last updated: September 13, 2025*
