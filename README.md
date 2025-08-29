# Auto Gladiators

A standalone auto-battler game inspired by Dota 2's Auto Gladiators arcade mode. Built incrementally with modular components for easy development and maintenance.

## 🎮 Live Demo

**Hero Selection Component:** https://dota-gladius-app-l00kly3e.devinapps.com

## 📋 Project Overview

Auto Gladiators is being built piece by piece with the following planned components:

### ✅ Completed Components
- **Hero Selection** - Choose from 6 unique heroes with different stats and abilities

### 🚧 Planned Components
- **Combat System** - Automated 1v1 battles between heroes
- **Shop/Upgrade System** - Purchase abilities, items, and relics between rounds
- **Economy System** - Point wagering and rewards
- **Sects System** - Hero factions with unique bonuses
- **Tournament Mode** - Multiple rounds with progression

## 🏗️ Architecture

The project uses a modular file structure with separate components:

```
auto-gladiators/
├── index.html              # Main HTML entry point
├── js/
│   ├── main.js             # Game initialization and screen management
│   ├── hero-selection.js   # Hero selection component
│   └── [future components] # Combat, shop, etc.
├── styles/
│   └── main.css            # Responsive CSS with mobile-first design
├── data/
│   └── heroes.js           # Hero definitions and stats
└── build/                  # Deployment build directory
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
- Automated 1v1 battles
- Turn-based with real-time animations
- Ability cooldowns and timing
- Damage calculations with armor/resistance

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
- Local web server (Python, Node.js, or any HTTP server)

### Running Locally
```bash
# Clone the repository
git clone <repository-url>
cd auto-gladiators

# Start a local web server
python3 -m http.server 8080
# OR
npx serve .
# OR
php -S localhost:8080

# Open browser to http://localhost:8080
```

### File Structure Guidelines
- Keep components modular and separate
- Use ES6 modules for imports/exports
- Mobile-first responsive design
- Maintain consistent code style

## 📱 Responsive Design

The game is built with mobile-first responsive design:

- **Mobile (< 768px)**: Compact layout, touch-friendly controls
- **Tablet (768px - 1024px)**: Enhanced spacing and larger elements  
- **Desktop (> 1024px)**: Full-featured layout with maximum screen usage

## 🚀 Deployment

The project is deployment-ready with a build system:

```bash
# Create build directory
mkdir build
cp index.html build/
cp -r js styles data build/

# Deploy build/ directory to any static hosting service
```

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

**Current Status**: Hero Selection Component Complete
**Next Component**: Combat System
**Live Demo**: https://dota-gladius-app-l00kly3e.devinapps.com

---
*Last updated: August 29, 2025*
