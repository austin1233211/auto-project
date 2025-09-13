const pool = require('../config/database');

class Ability {
  static async findAll() {
    const query = 'SELECT * FROM abilities ORDER BY tier, name';
    const result = await pool.query(query);
    return result.rows;
  }
  
  static async findByTier(tier) {
    const query = 'SELECT * FROM abilities WHERE tier = $1 ORDER BY name';
    const result = await pool.query(query, [tier]);
    return result.rows;
  }
  
  static async findById(id) {
    const query = 'SELECT * FROM abilities WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
  
  static async create(abilityData) {
    const { name, effect, value, tier, cost, emoji, description } = abilityData;
    
    const query = `
      INSERT INTO abilities (name, effect, value, tier, cost, emoji, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, effect, value, tier, cost, emoji, description]);
    return result.rows[0];
  }
  
  static async purchaseForPlayer(tournamentPlayerId, abilityId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const abilityQuery = 'SELECT * FROM abilities WHERE id = $1';
      const abilityResult = await client.query(abilityQuery, [abilityId]);
      const ability = abilityResult.rows[0];
      
      if (!ability) {
        throw new Error('Ability not found');
      }
      
      const playerQuery = 'SELECT * FROM tournament_players WHERE id = $1';
      const playerResult = await client.query(playerQuery, [tournamentPlayerId]);
      const player = playerResult.rows[0];
      
      if (!player) {
        throw new Error('Tournament player not found');
      }
      
      if (player.gold < ability.cost) {
        throw new Error('Insufficient gold');
      }
      
      const checkDuplicateQuery = `
        SELECT COUNT(*) as count FROM player_abilities 
        WHERE tournament_player_id = $1 AND ability_id = $2
      `;
      const duplicateResult = await client.query(checkDuplicateQuery, [tournamentPlayerId, abilityId]);
      
      if (parseInt(duplicateResult.rows[0].count) > 0) {
        throw new Error('Ability already purchased');
      }
      
      await client.query(
        'UPDATE tournament_players SET gold = gold - $1 WHERE id = $2',
        [ability.cost, tournamentPlayerId]
      );
      
      const purchaseQuery = `
        INSERT INTO player_abilities (tournament_player_id, ability_id)
        VALUES ($1, $2)
        RETURNING *
      `;
      
      const purchaseResult = await client.query(purchaseQuery, [tournamentPlayerId, abilityId]);
      
      await client.query('COMMIT');
      return { purchase: purchaseResult.rows[0], ability, newGold: player.gold - ability.cost };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  static async getPlayerAbilities(tournamentPlayerId) {
    const query = `
      SELECT a.* FROM abilities a
      JOIN player_abilities pa ON a.id = pa.ability_id
      WHERE pa.tournament_player_id = $1
      ORDER BY pa.purchased_at
    `;
    
    const result = await pool.query(query, [tournamentPlayerId]);
    return result.rows;
  }
}

module.exports = Ability;
