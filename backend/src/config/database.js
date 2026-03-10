const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

let pool;
if (databaseUrl) {
  pool = new Pool({ connectionString: databaseUrl });
}

const query = async (text, params = []) => {
  if (!pool) {
    throw new Error('DATABASE_URL is not configured.');
  }

  return pool.query(text, params);
};

module.exports = {
  hasDatabase: Boolean(pool),
  query
};
