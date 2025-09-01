
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE player_stats (
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  gold INTEGER DEFAULT 100,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  current_season_wins INTEGER DEFAULT 0,
  current_season_losses INTEGER DEFAULT 0,
  abilities JSONB DEFAULT '[]',
  items JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (player_id)
);

CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) DEFAULT 'Tournament',
  status VARCHAR(20) DEFAULT 'waiting',
  max_players INTEGER DEFAULT 8,
  current_players INTEGER DEFAULT 0,
  entry_fee INTEGER DEFAULT 0,
  prize_pool INTEGER DEFAULT 0,
  tournament_type VARCHAR(20) DEFAULT 'elimination',
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE tournament_participants (
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  hero_id VARCHAR(50) NOT NULL,
  current_health INTEGER NOT NULL,
  max_health INTEGER NOT NULL,
  current_mana INTEGER DEFAULT 0,
  max_mana INTEGER DEFAULT 100,
  status VARCHAR(20) DEFAULT 'active',
  placement INTEGER,
  prize_won INTEGER DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (tournament_id, player_id)
);

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  player1_id UUID REFERENCES players(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES players(id) ON DELETE CASCADE,
  winner_id UUID REFERENCES players(id),
  status VARCHAR(20) DEFAULT 'pending',
  battle_log JSONB DEFAULT '[]',
  match_duration INTEGER,
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_players_email ON players(email);
CREATE INDEX idx_players_active ON players(is_active);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_created ON tournaments(created_at);
CREATE INDEX idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_player ON tournament_participants(player_id);
CREATE INDEX idx_tournament_participants_status ON tournament_participants(status);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_round ON matches(tournament_id, round_number);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_players ON matches(player1_id, player2_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_stats_updated_at BEFORE UPDATE ON player_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION create_player_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO player_stats (player_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_player_stats_trigger AFTER INSERT ON players
    FOR EACH ROW EXECUTE FUNCTION create_player_stats();
