const { Pool } = require('pg');
const { newDb } = require('pg-mem');
const fs = require('fs');
const path = require('path');
const { config } = require('./env');

let activeDb = null;

class PgPoolClient {
  constructor(pool) {
    this.pool = pool;
  }

  async query(text, params) {
    return this.pool.query(text, params);
  }

  async end() {
    await this.pool.end();
  }

  getType() {
    return 'postgres';
  }

  async checkHealth() {
    const start = Date.now();
    try {
      await this.pool.query('SELECT 1');
      return { isConnected: true, type: 'PostgreSQL Server', latencyMs: Date.now() - start };
    } catch {
      return { isConnected: false, type: 'PostgreSQL Server', latencyMs: Date.now() - start };
    }
  }
}

class PgMemClient {
  constructor(memDb) {
    this.memDb = memDb;
    this.adapter = this.memDb.adapters.createPg();
  }

  async query(text, params) {
    const pool = new this.adapter.Pool();
    try {
      const res = await pool.query(text, params);
      return res;
    } finally {
      await pool.end();
    }
  }

  async end() {
    // In-memory db doesn't require socket shutdown
  }

  getType() {
    return 'in-memory-postgres';
  }

  async checkHealth() {
    const start = Date.now();
    try {
      await this.query('SELECT 1');
      return { isConnected: true, type: 'In-Memory PostgreSQL Engine', latencyMs: Date.now() - start };
    } catch {
      return { isConnected: false, type: 'In-Memory PostgreSQL Engine', latencyMs: Date.now() - start };
    }
  }
}

async function getDb() {
  if (activeDb) {
    return activeDb;
  }

  // In test environment without explicit external DB override, prefer in-memory for speed and isolation
  if (process.env.NODE_ENV === 'test' && !process.env.FORCE_EXTERNAL_DB) {
    const memDb = newDb();
    activeDb = new PgMemClient(memDb);
    const schemaPath = path.resolve(__dirname, '../db/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf-8');
      await activeDb.query(sql);
    }
    return activeDb;
  }

  // Attempt real PostgreSQL connection
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalDb = config.database.url.includes('localhost') || config.database.url.includes('127.0.0.1');

  const pool = new Pool({
    connectionString: config.database.url,
    ssl: (isProduction && !isLocalDb) ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 10000,
    max: 10,
    idleTimeoutMillis: 30000,
  });

  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('[Database] Connected successfully to external PostgreSQL server.');
    activeDb = new PgPoolClient(pool);
    return activeDb;
  } catch (err) {
    await pool.end().catch(() => {});
    console.warn(`[Database] External PostgreSQL not reachable (${err.message}).`);

    if (config.database.usePgliteFallback) {
      console.log('[Database] Activating fast In-Memory PostgreSQL engine for standalone operation.');
      const memDb = newDb();
      activeDb = new PgMemClient(memDb);

      // Auto-run schema migrations on fallback database
      try {
        const schemaPath = path.resolve(__dirname, '../db/schema.sql');
        if (fs.existsSync(schemaPath)) {
          const sql = fs.readFileSync(schemaPath, 'utf-8');
          await activeDb.query(sql);
          console.log('[Database] Initialized schema on in-memory PostgreSQL engine successfully.');
        }
      } catch (schemaErr) {
        console.error('[Database] Failed to initialize schema:', schemaErr);
      }

      return activeDb;
    } else {
      throw new Error(`Failed to connect to PostgreSQL: ${err.message}`);
    }
  }
}

async function closeDb() {
  if (activeDb) {
    await activeDb.end();
    activeDb = null;
  }
}

module.exports = {
  getDb,
  closeDb,
};
