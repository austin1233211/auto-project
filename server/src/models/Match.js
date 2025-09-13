const pool = require('../config/database');

class Match {
  static async create(matchData) {
    const { tournamentId, roundNumber, player1Id, player2Id } = matchData;
    
    const query = `
      INSERT INTO matches (tournament_id, round_number, player1_id, player2_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [tournamentId, roundNumber, player1Id, player2Id]);
    return result.rows[0];
  }
  
  static async findById(id) {
    const query = `
      SELECT m.*, 
             p1.username as player1_username, h1.name as player1_hero,
             p2.username as player2_username, h2.name as player2_hero
      FROM matches m
      LEFT JOIN tournament_players tp1 ON m.player1_id = tp1.id
      LEFT JOIN players p1 ON tp1.player_id = p1.id
      LEFT JOIN heroes h1 ON tp1.hero_id = h1.id
      LEFT JOIN tournament_players tp2 ON m.player2_id = tp2.id
      LEFT JOIN players p2 ON tp2.player_id = p2.id
      LEFT JOIN heroes h2 ON tp2.hero_id = h2.id
      WHERE m.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
  
  static async findByTournamentRound(tournamentId, roundNumber) {
    const query = `
      SELECT m.*, 
             p1.username as player1_username, h1.name as player1_hero,
             p2.username as player2_username, h2.name as player2_hero
      FROM matches m
      LEFT JOIN tournament_players tp1 ON m.player1_id = tp1.id
      LEFT JOIN players p1 ON tp1.player_id = p1.id
      LEFT JOIN heroes h1 ON tp1.hero_id = h1.id
      LEFT JOIN tournament_players tp2 ON m.player2_id = tp2.id
      LEFT JOIN players p2 ON tp2.player_id = p2.id
      LEFT JOIN heroes h2 ON tp2.hero_id = h2.id
      WHERE m.tournament_id = $1 AND m.round_number = $2
      ORDER BY m.created_at
    `;
    
    const result = await pool.query(query, [tournamentId, roundNumber]);
    return result.rows;
  }
  
  static async updateStatus(id, status) {
    const query = `
      UPDATE matches 
      SET status = $1,
          ${status === 'in_progress' ? 'started_at = CURRENT_TIMESTAMP,' : ''}
          ${status === 'completed' ? 'completed_at = CURRENT_TIMESTAMP,' : ''}
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }
  
  static async completeMatch(matchId, result) {
    const { winnerId, player1DamageDealt, player2DamageDealt, 
            player1HealthLost, player2HealthLost, battleLog } = result;
    
    const query = `
      UPDATE matches 
      SET status = 'completed',
          winner_id = $1,
          player1_damage_dealt = $2,
          player2_damage_dealt = $3,
          player1_health_lost = $4,
          player2_health_lost = $5,
          battle_log = $6,
          completed_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    
    const values = [winnerId, player1DamageDealt, player2DamageDealt, 
                   player1HealthLost, player2HealthLost, battleLog, matchId];
    
    const matchResult = await pool.query(query, values);
    return matchResult.rows[0];
  }
  
  static async addEvent(matchId, eventType, eventData, timestampOffset) {
    const query = `
      INSERT INTO match_events (match_id, event_type, event_data, timestamp_offset)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [matchId, eventType, JSON.stringify(eventData), timestampOffset]);
    return result.rows[0];
  }
  
  static async getEvents(matchId) {
    const query = `
      SELECT * FROM match_events 
      WHERE match_id = $1 
      ORDER BY timestamp_offset
    `;
    
    const result = await pool.query(query, [matchId]);
    return result.rows.map(row => ({
      ...row,
      event_data: JSON.parse(row.event_data)
    }));
  }
}

module.exports = Match;
