const pool = require('../config/database');

class Hero {
  static async findAll() {
    const query = `
      SELECT * FROM heroes 
      ORDER BY class, name
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }
  
  static async findById(id) {
    const query = 'SELECT * FROM heroes WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
  
  static async findByClass(heroClass) {
    const query = 'SELECT * FROM heroes WHERE class = $1 ORDER BY name';
    const result = await pool.query(query, [heroClass]);
    return result.rows;
  }
  
  static async create(heroData) {
    const {
      name, class: heroClass, baseHealth, baseAttack, baseArmor, baseSpeed,
      passiveAbilityName, passiveAbilityDescription,
      ultimateAbilityName, ultimateAbilityDescription
    } = heroData;
    
    const query = `
      INSERT INTO heroes (
        name, class, base_health, base_attack, base_armor, base_speed,
        passive_ability_name, passive_ability_description,
        ultimate_ability_name, ultimate_ability_description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      name, heroClass, baseHealth, baseAttack, baseArmor, baseSpeed,
      passiveAbilityName, passiveAbilityDescription,
      ultimateAbilityName, ultimateAbilityDescription
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  static async getPlayerHeroWithModifications(tournamentPlayerId) {
    const query = `
      SELECT 
        h.*,
        tp.current_health,
        tp.gold,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', a.id,
              'name', a.name,
              'effect', a.effect,
              'value', a.value,
              'tier', a.tier,
              'cost', a.cost,
              'emoji', a.emoji,
              'description', a.description
            )
          ) FILTER (WHERE a.id IS NOT NULL), 
          '[]'
        ) as purchased_abilities,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', ar.id,
              'name', ar.name,
              'effect', ar.effect,
              'value', ar.value,
              'emoji', ar.emoji,
              'description', ar.description
            )
          ) FILTER (WHERE ar.id IS NOT NULL), 
          '[]'
        ) as artifacts,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', e.id,
              'name', e.name,
              'stat', e.stat,
              'value', e.value,
              'tier', e.tier,
              'emoji', e.emoji,
              'description', e.description
            )
          ) FILTER (WHERE e.id IS NOT NULL), 
          '[]'
        ) as equipment
      FROM tournament_players tp
      JOIN heroes h ON tp.hero_id = h.id
      LEFT JOIN player_abilities pa ON tp.id = pa.tournament_player_id
      LEFT JOIN abilities a ON pa.ability_id = a.id
      LEFT JOIN player_artifacts par ON tp.id = par.tournament_player_id
      LEFT JOIN artifacts ar ON par.artifact_id = ar.id
      LEFT JOIN player_equipment pe ON tp.id = pe.tournament_player_id
      LEFT JOIN equipment e ON pe.equipment_id = e.id
      WHERE tp.id = $1
      GROUP BY h.id, tp.current_health, tp.gold
    `;
    
    const result = await pool.query(query, [tournamentPlayerId]);
    return result.rows[0];
  }
}

module.exports = Hero;
