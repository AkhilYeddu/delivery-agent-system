const { Pool } = require('pg');
const { config } = require('./env');

let pool = null;

function createPool() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalDb =
    config.database.url.includes('localhost') || config.database.url.includes('127.0.0.1');

  return new Pool({
    connectionString: config.database.url,
    ssl: isProduction && !isLocalDb ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 10000,
    max: 10,
    idleTimeoutMillis: 30000,
  });
}

async function getDb() {
  if (!pool) {
    pool = createPool();
  }

  return {
    async query(text, params) {
      return pool.query(text, params);
    },

    async end() {
      await pool.end();
      pool = null;
    },

    getType() {
      return 'postgres';
    },

    async checkHealth() {
      const start = Date.now();
      try {
        await pool.query('SELECT 1');
        return {
          isConnected: true,
          type: 'PostgreSQL',
          latencyMs: Date.now() - start,
        };
      } catch (err) {
        return {
          isConnected: false,
          type: 'PostgreSQL',
          latencyMs: Date.now() - start,
          error: err.message,
        };
      }
    },
  };
}

async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { getDb, closeDb };
