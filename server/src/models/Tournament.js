const pool = require('../config/database');

class Tournament {
  static async create({ name, maxPlayers = 8, createdBy }) {
    const query = `
      INSERT INTO tournaments (name, max_players, created_by)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, maxPlayers, createdBy]);
    return result.rows[0];
  }
  
  static async findById(id) {
    const query = 'SELECT * FROM tournaments WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
  
  static async findActive() {
    const query = `
      SELECT t.*, COUNT(tp.id) as player_count
      FROM tournaments t
      LEFT JOIN tournament_players tp ON t.id = tp.tournament_id
      WHERE t.status IN ('waiting', 'active')
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }
  
  static async addPlayer(tournamentId, playerId, heroId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const checkQuery = `
        SELECT COUNT(*) as count FROM tournament_players 
        WHERE tournament_id = $1
      `;
      const countResult = await client.query(checkQuery, [tournamentId]);
      const currentPlayers = parseInt(countResult.rows[0].count);
      
      const tournamentQuery = 'SELECT max_players FROM tournaments WHERE id = $1';
      const tournamentResult = await client.query(tournamentQuery, [tournamentId]);
      const maxPlayers = tournamentResult.rows[0]?.max_players || 8;
      
      if (currentPlayers >= maxPlayers) {
        throw new Error('Tournament is full');
      }
      
      const insertQuery = `
        INSERT INTO tournament_players (tournament_id, player_id, hero_id)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      
      const result = await client.query(insertQuery, [tournamentId, playerId, heroId]);
      
      if (currentPlayers === 0) {
        await this.generateAIPlayers(client, tournamentId, maxPlayers - 1);
      }
      
      await client.query(
        'UPDATE tournaments SET status = $1, started_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['active', tournamentId]
      );
      
      await client.query('COMMIT');
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async generateAIPlayers(client, tournamentId, count) {
    console.log(`=== GENERATING ${count} AI PLAYERS FOR TOURNAMENT ${tournamentId} ===`);
    
    const heroesQuery = 'SELECT id FROM heroes ORDER BY id';
    const heroesResult = await client.query(heroesQuery);
    const availableHeroes = heroesResult.rows;
    
    if (availableHeroes.length === 0) {
      throw new Error('No heroes available for AI players');
    }
    
    const aiNames = [
      'Shadowblade', 'Ironforge', 'Stormwind', 'Frostborn', 'Flameheart',
      'Nightfall', 'Goldbeard', 'Swiftarrow', 'Thunderstrike', 'Moonwhisper',
      'Dragonslayer', 'Voidwalker', 'Starweaver', 'Bloodfang', 'Iceshield'
    ];
    
    for (let i = 0; i < count; i++) {
      const aiName = aiNames[i % aiNames.length] + (i >= aiNames.length ? (Math.floor(i / aiNames.length) + 1) : '');
      const createPlayerQuery = `
        INSERT INTO players (username, email, password_hash, is_ai)
        VALUES ($1, $2, $3, true)
        ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username
        RETURNING id
      `;
      
      const playerResult = await client.query(createPlayerQuery, [
        aiName,
        `${aiName.toLowerCase()}@ai.local`,
        'ai_player_hash'
      ]);
      
      const aiPlayerId = playerResult.rows[0].id;
      
      const randomHero = availableHeroes[Math.floor(Math.random() * availableHeroes.length)];
      
      const addAIQuery = `
        INSERT INTO tournament_players (tournament_id, player_id, hero_id)
        VALUES ($1, $2, $3)
      `;
      
      await client.query(addAIQuery, [tournamentId, aiPlayerId, randomHero.id]);
      
      console.log(`=== CREATED AI PLAYER: ${aiName} with hero ID ${randomHero.id} ===`);
    }
    
    console.log(`=== SUCCESSFULLY GENERATED ${count} AI PLAYERS ===`);
  }
  
  static async getPlayers(tournamentId) {
    const query = `
      SELECT tp.*, p.username, h.name as hero_name, h.class as hero_class,
             h.base_health, h.base_attack, h.base_armor, h.base_speed,
             h.passive_ability_name, h.ultimate_ability_name,
             h.passive_ability_description, h.ultimate_ability_description
      FROM tournament_players tp
      JOIN players p ON tp.player_id = p.id
      JOIN heroes h ON tp.hero_id = h.id
      WHERE tp.tournament_id = $1
      ORDER BY tp.joined_at
    `;
    
    console.log('=== TOURNAMENT MODEL: Executing getPlayers query for tournament:', tournamentId);
    const result = await pool.query(query, [tournamentId]);
    console.log('=== TOURNAMENT MODEL: Raw query result:', result.rows);
    console.log('=== TOURNAMENT MODEL: First row structure:', result.rows[0]);
    return result.rows;
  }
  
  static async updateStatus(id, status) {
    const query = `
      UPDATE tournaments 
      SET status = $1, 
          ${status === 'active' ? 'started_at = CURRENT_TIMESTAMP,' : ''}
          ${status === 'completed' ? 'completed_at = CURRENT_TIMESTAMP,' : ''}
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }
  
  static async updateRound(id, roundNumber) {
    const query = `
      UPDATE tournaments 
      SET current_round = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [roundNumber, id]);
    return result.rows[0];
  }
  
  static async eliminatePlayer(tournamentPlayerId, placement) {
    const query = `
      UPDATE tournament_players 
      SET is_eliminated = true, 
          placement = $1,
          eliminated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [placement, tournamentPlayerId]);
    return result.rows[0];
  }
}

module.exports = Tournament;
