import fs from 'fs';
import path from 'path';
import { getDb, closeDb } from '../config/db';

export async function runMigrations(): Promise<void> {
  const db = await getDb();
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');

  console.log('[Migration] Running PostgreSQL schema migrations...');
  await db.query(sql);
  console.log('[Migration] Schema migrations applied successfully.');
}

if (require.main === module) {
  (async () => {
    try {
      await runMigrations();
    } catch (err: any) {
      console.error('[Migration] Migration failed:', err.message);
      process.exit(1);
    } finally {
      await closeDb();
      process.exit(0);
    }
  })();
}
