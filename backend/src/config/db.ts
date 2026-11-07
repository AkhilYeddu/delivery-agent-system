import { Pool, QueryResult, QueryResultRow } from 'pg';
import { newDb, IMemoryDb } from 'pg-mem';
import fs from 'fs';
import path from 'path';
import { config } from './env';

export interface DatabaseClient {
  query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
  end(): Promise<void>;
  getType(): 'postgres' | 'in-memory-postgres';
  checkHealth(): Promise<{ isConnected: boolean; type: string; latencyMs: number }>;
}

let activeDb: DatabaseClient | null = null;

class PgPoolClient implements DatabaseClient {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  async end(): Promise<void> {
    await this.pool.end();
  }

  getType(): 'postgres' {
    return 'postgres';
  }

  async checkHealth(): Promise<{ isConnected: boolean; type: string; latencyMs: number }> {
    const start = Date.now();
    try {
      await this.pool.query('SELECT 1');
      return { isConnected: true, type: 'PostgreSQL Server', latencyMs: Date.now() - start };
    } catch {
      return { isConnected: false, type: 'PostgreSQL Server', latencyMs: Date.now() - start };
    }
  }
}

class PgMemClient implements DatabaseClient {
  private memDb: IMemoryDb;
  private adapter: any;

  constructor(memDb: IMemoryDb) {
    this.memDb = memDb;
    this.adapter = this.memDb.adapters.createPg();
  }

  async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const pool = new this.adapter.Pool();
    try {
      const res = await pool.query(text, params);
      return res;
    } finally {
      await pool.end();
    }
  }

  async end(): Promise<void> {
    // In-memory db doesn't require socket shutdown
  }

  getType(): 'in-memory-postgres' {
    return 'in-memory-postgres';
  }

  async checkHealth(): Promise<{ isConnected: boolean; type: string; latencyMs: number }> {
    const start = Date.now();
    try {
      await this.query('SELECT 1');
      return { isConnected: true, type: 'In-Memory PostgreSQL Engine', latencyMs: Date.now() - start };
    } catch {
      return { isConnected: false, type: 'In-Memory PostgreSQL Engine', latencyMs: Date.now() - start };
    }
  }
}

export async function getDb(): Promise<DatabaseClient> {
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
  const pool = new Pool({
    connectionString: config.database.url,
    connectionTimeoutMillis: 2000,
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
  } catch (err: any) {
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
      } catch (schemaErr: any) {
        console.error('[Database] Failed to initialize schema:', schemaErr);
      }

      return activeDb;
    } else {
      throw new Error(`Failed to connect to PostgreSQL: ${err.message}`);
    }
  }
}

export async function closeDb(): Promise<void> {
  if (activeDb) {
    await activeDb.end();
    activeDb = null;
  }
}
