
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_ai BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS heroes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    class VARCHAR(50) NOT NULL,
    base_health DECIMAL(10,2) NOT NULL,
    base_attack DECIMAL(10,2) NOT NULL,
    base_armor DECIMAL(10,2) NOT NULL,
    base_speed DECIMAL(10,2) NOT NULL,
    passive_ability_name VARCHAR(100),
    passive_ability_description TEXT,
    ultimate_ability_name VARCHAR(100),
    ultimate_ability_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS abilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    effect VARCHAR(50) NOT NULL,
    value INTEGER NOT NULL,
    tier INTEGER NOT NULL CHECK (tier IN (1, 2, 3)),
    cost INTEGER NOT NULL,
    emoji VARCHAR(10),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artifacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    effect VARCHAR(50) NOT NULL,
    value INTEGER NOT NULL,
    round_available INTEGER NOT NULL,
    emoji VARCHAR(10),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    stat VARCHAR(50) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    tier INTEGER NOT NULL CHECK (tier IN (1, 2, 3)),
    emoji VARCHAR(10),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
    current_round INTEGER DEFAULT 1,
    max_players INTEGER DEFAULT 8,
    created_by INTEGER REFERENCES players(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tournament_players (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id),
    hero_id INTEGER REFERENCES heroes(id),
    current_health INTEGER DEFAULT 50,
    max_health INTEGER DEFAULT 50,
    gold INTEGER DEFAULT 300,
    consecutive_wins INTEGER DEFAULT 0,
    consecutive_losses INTEGER DEFAULT 0,
    rounds_played INTEGER DEFAULT 0,
    is_eliminated BOOLEAN DEFAULT FALSE,
    placement INTEGER,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    eliminated_at TIMESTAMP,
    UNIQUE(tournament_id, player_id)
);

CREATE TABLE IF NOT EXISTS player_abilities (
    id SERIAL PRIMARY KEY,
    tournament_player_id INTEGER REFERENCES tournament_players(id) ON DELETE CASCADE,
    ability_id INTEGER REFERENCES abilities(id),
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player_artifacts (
    id SERIAL PRIMARY KEY,
    tournament_player_id INTEGER REFERENCES tournament_players(id) ON DELETE CASCADE,
    artifact_id INTEGER REFERENCES artifacts(id),
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player_equipment (
    id SERIAL PRIMARY KEY,
    tournament_player_id INTEGER REFERENCES tournament_players(id) ON DELETE CASCADE,
    equipment_id INTEGER REFERENCES equipment(id),
    equipped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    player1_id INTEGER REFERENCES tournament_players(id),
    player2_id INTEGER REFERENCES tournament_players(id),
    winner_id INTEGER REFERENCES tournament_players(id),
    player1_damage_dealt INTEGER DEFAULT 0,
    player2_damage_dealt INTEGER DEFAULT 0,
    player1_health_lost INTEGER DEFAULT 0,
    player2_health_lost INTEGER DEFAULT 0,
    battle_log TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS match_events (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    timestamp_offset INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournament_players_tournament_id ON tournament_players(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_players_player_id ON tournament_players(player_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament_round ON matches(tournament_id, round_number);
CREATE INDEX IF NOT EXISTS idx_matches_players ON matches(player1_id, player2_id);
CREATE INDEX IF NOT EXISTS idx_player_abilities_tournament_player ON player_abilities(tournament_player_id);
CREATE INDEX IF NOT EXISTS idx_player_artifacts_tournament_player ON player_artifacts(tournament_player_id);
CREATE INDEX IF NOT EXISTS idx_player_equipment_tournament_player ON player_equipment(tournament_player_id);
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id);
