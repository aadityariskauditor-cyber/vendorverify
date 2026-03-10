const pool = require('../config/db');

async function createUser({ name, email, passwordHash, role }) {
  const query = `
    INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at;
  `;
  const values = [name, email, passwordHash, role || 'vendor'];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

async function findUserByEmail(email) {
  const { rows } = await pool.query(
    'SELECT id, name, email, role, password_hash FROM users WHERE email = $1 LIMIT 1;',
    [email]
  );

  return rows[0] || null;
}

module.exports = {
  createUser,
  findUserByEmail,
};
