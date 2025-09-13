const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class Player {
  static async create({ username, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO players (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at
    `;
    
    const result = await pool.query(query, [username, email, hashedPassword]);
    return result.rows[0];
  }
  
  static async findByEmail(email) {
    const query = 'SELECT * FROM players WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }
  
  static async findByUsername(username) {
    const query = 'SELECT * FROM players WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }
  
  static async findById(id) {
    const query = 'SELECT id, username, email, created_at FROM players WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
  
  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
  
  static async updateProfile(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const query = `
      UPDATE players 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, username, email, updated_at
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = Player;
