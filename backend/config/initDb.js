const pool = require('./db');

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(30) NOT NULL DEFAULT 'vendor',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vendors (
      id SERIAL PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      contact_person VARCHAR(150) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      country VARCHAR(100),
      service_category VARCHAR(120),
      risk_score INTEGER DEFAULT 0,
      status VARCHAR(30) NOT NULL DEFAULT 'Pending',
      notes TEXT[] DEFAULT ARRAY[]::TEXT[],
      documents TEXT[] DEFAULT ARRAY[]::TEXT[],
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

module.exports = initializeDatabase;
