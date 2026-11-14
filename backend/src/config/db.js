const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config();

const { Pool } = require('pg');

let pool = null;

function createPool() {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/delivery_db';
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalDb = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

  return new Pool({
    connectionString: dbUrl,
    ssl: isProduction && !isLocalDb ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 5000,
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
      if (pool) {
        await pool.end();
        pool = null;
      }
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
          error: err.message || err.code || 'Could not connect to PostgreSQL server',
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
