# Auto Gladiators

A standalone auto-battler game inspired by Dota 2's Auto Gladiators arcade mode. Built incrementally with modular components for easy development and maintenance.

## 🎮 Live Demo

**Hero Selection Component:** https://dota-gladius-app-l00kly3e.devinapps.com

## 📋 Project Overview

Auto Gladiators is being built piece by piece with the following planned components:

### ✅ Completed Components
- **Hero Selection** - Choose from 37 unique heroes with different stats and abilities
- **Combat System** - Simultaneous combat with independent attack timers
- **Multiplayer Backend** - Scalable FastAPI backend with PostgreSQL database

### 🚧 Planned Components
- **Real-time Tournament System** - WebSocket-based live tournament updates
- **Shop/Upgrade System** - Purchase abilities, items, and relics between rounds
- **Economy System** - Point wagering and rewards
- **Sects System** - Hero factions with unique bonuses

## 🏗️ Architecture

The project uses a modular full-stack architecture with separate frontend and backend components:

### Frontend Structure
```
frontend/
├── index.html              # Main HTML entry point
├── main.js                 # Game initialization and screen management
├── hero-selection.js       # Hero selection component
├── combat.js               # Simultaneous combat system
├── rounds-manager.js       # Tournament progression logic
├── abilities.js            # Hero ability system
├── heroes.js               # Hero definitions and stats (37 heroes)
├── main.css                # Responsive CSS with mobile-first design
└── build/                  # Deployment build directory
```

### Backend Structure
```
backend/
├── app/
│   ├── main.py             # FastAPI application entry point
│   ├── database.py         # Database connection and session management
│   ├── models.py           # SQLAlchemy database models
│   ├── schemas.py          # Pydantic request/response schemas
│   ├── auth.py             # JWT authentication system
│   ├── combat_engine.py    # Headless combat simulation engine
│   ├── tournament_manager.py # Tournament coordination logic
│   ├── heroes.py           # Hero data for backend processing
│   └── routers/
│       ├── auth.py         # Authentication endpoints
│       ├── tournaments.py  # Tournament management API
│       ├── players.py      # Player profile and stats API
│       └── matches.py      # Match coordination API
├── database/
│   └── schema.sql          # PostgreSQL database schema
├── scripts/
│   └── setup_db.py         # Database initialization script
├── pyproject.toml          # Poetry dependencies and configuration
└── .env                    # Environment configuration
```

## 🦸 Heroes

The game features 37 unique heroes across 3 attribute types:

### Strength Heroes (12 heroes)
- **Warrior** ⚔️, **Paladin** 🛡️, **Axe** 🪓, **Bristleback** 🦔, **Dragon Knight** 🐉, **Earthshaker** 🌍, **Huskar** 🔥, **Legion Commander** ⚔️, **Magnus** 🐘, **Pudge** 🪝, **Sven** ⚡, **Tidehunter** 🌊, **Tiny** 🗿, **Undying** 💀

### Intelligence Heroes (12 heroes)  
- **Mage** 🔮, **Necromancer** 💀, **Alchemist** ⚗️, **Lina** 🔥, **Lion** 🦁, **Skywrath Mage** ⚡, **Anti-Mage** 🚫, **Faceless Void** ⏰, **Invoker** 🌟, **Shadow Fiend** 👹, **Yamashita** 🗾, **Zombie Guitarist** 🎸

### Agility Heroes (13 heroes)
- **Archer** 🏹, **Assassin** 🗡️, **Chaos Knight** 🐴, **Clinkz** 💀, **Hoodwink** 🐿️, **Juggernaut** ⚔️, **Mirana** 🌙, **Omniknight** 🛡️, **Riki** 👤, **Slark** 🐟, **Sniper** 🎯, **Viper** 🐍, **Phantom Assassin** 🗡️

Each hero has unique:
- Base stats (Health, Attack, Armor, Speed)
- 1 passive ability (always active)
- 1 ultimate ability (triggers when mana reaches 100%)
- Attribute type bonuses

## 🎯 Game Mechanics

### Combat System ✅
- Automated 1v1 battles with simultaneous combat
- Independent attack timers based on hero speed
- Passive abilities active throughout combat
- Ultimate abilities trigger when mana reaches 100%
- Damage calculations with armor/resistance
- Real-time battle progression

### Multiplayer Architecture ✅
- FastAPI backend with PostgreSQL database
- JWT-based player authentication
- RESTful API for tournament and match management
- Extensible database schema for future features
- Scalable tournament coordination system

### Progression System (Planned)
- Earn gold from victories
- Spend gold on upgrades between rounds
- Ability upgrades (damage, cooldown, effects)
- Item purchases (stat bonuses, special effects)
- Achievement system tracking

### Tournament System (Partial)
- Elimination-style tournaments
- User's selected hero fights first
- Simultaneous match processing for multiplayer
- Tournament bracket progression
- Prize distribution system

## 🛠️ Development Setup

### Prerequisites
- Modern web browser with ES6 module support
- Python 3.12+ with Poetry for backend development
- PostgreSQL (for production) or SQLite (for development)
- Local web server for frontend

### Running Frontend Locally
```bash
# Clone the repository
git clone <repository-url>
cd auto-project

# Start a local web server for frontend
python3 -m http.server 8080
# OR
npx serve .

# Open browser to http://localhost:8080
```

### Running Backend Locally
```bash
# Navigate to backend directory
cd backend

# Install dependencies with Poetry
poetry install

# Copy environment configuration
cp .env.example .env

# Start the FastAPI development server
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# API will be available at http://localhost:8000
# API documentation at http://localhost:8000/docs
```

### Database Setup
```bash
# The backend uses SQLite by default for development
# Database file: backend/auto_gladiators.db
# Schema is automatically created on first run

# For PostgreSQL production setup:
# 1. Update DATABASE_URL in .env
# 2. Run: poetry run python scripts/setup_db.py
```

### File Structure Guidelines
- Keep components modular and separate
- Use ES6 modules for frontend imports/exports
- Follow FastAPI patterns for backend structure
- Mobile-first responsive design
- Maintain consistent code style across frontend and backend

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
- [x] Hero selection interface (37 heroes)
- [x] Responsive design system
- [x] Modular architecture
- [x] Combat system with simultaneous attacks
- [x] Passive and ultimate ability system

### Phase 2: Multiplayer Backend ✅
- [x] FastAPI backend architecture
- [x] PostgreSQL database schema
- [x] JWT authentication system
- [x] Tournament and match management APIs
- [x] Combat engine ported to Python
- [x] Extensible database design

### Phase 3: Real-time Features 🚧
- [ ] WebSocket server for live updates
- [ ] Redis caching for match states
- [ ] Real-time tournament bracket updates
- [ ] Player-specific combat streaming

### Phase 4: Economy & Progression 🚧
- [ ] Gold and reward system
- [ ] Shop/upgrade interface
- [ ] Item system with stat bonuses
- [ ] Achievement tracking

### Phase 5: Advanced Features 🚧
- [ ] Relic system
- [ ] Sects/faction bonuses
- [ ] Leaderboards and rankings
- [ ] Tournament history

### Phase 6: Polish 🚧
- [ ] Sound effects and music
- [ ] Animations and visual effects
- [ ] Balancing and optimization
- [ ] Mobile app deployment

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

## 🔌 API Endpoints

The backend provides RESTful APIs for multiplayer functionality:

### Authentication
- `POST /api/auth/register` - Register new player
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current player profile

### Tournaments
- `GET /api/tournaments` - List available tournaments
- `POST /api/tournaments` - Create new tournament
- `POST /api/tournaments/{id}/join` - Join tournament with hero selection
- `GET /api/tournaments/{id}` - Get tournament details and bracket

### Players
- `GET /api/players/me` - Get player stats and profile
- `PUT /api/players/me` - Update player profile
- `GET /api/players/me/stats` - Get detailed player statistics

### Matches
- `GET /api/matches/{id}` - Get match details and battle log
- `GET /api/tournaments/{id}/matches` - Get all matches for tournament

Full API documentation available at `/docs` when running the backend server.

## 🗄️ Database Schema

The PostgreSQL database uses an extensible design with JSONB columns for future features:

- **players** - User accounts and authentication
- **player_stats** - Extensible stats with JSONB for gold, abilities, items, achievements
- **tournaments** - Tournament metadata and configuration
- **tournament_participants** - Player participation with hero selection
- **matches** - Individual battles with complete battle logs

---

**Current Status**: Multiplayer Backend Architecture Complete
**Next Phase**: Real-time Features (WebSocket + Redis)
**Live Demo**: https://dota-gladius-app-l00kly3e.devinapps.com

---
*Last updated: September 1, 2025*
