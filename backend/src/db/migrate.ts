import fs from 'fs';
import path from 'path';
import { getDb, closeDb } from '../config/db';

export async function runMigrations(): Promise<void> {
  const db = await getDb();
  
  const possiblePaths = [
    path.resolve(__dirname, 'schema.sql'),
    path.resolve(__dirname, '../../src/db/schema.sql'),
    path.resolve(process.cwd(), 'src/db/schema.sql'),
    path.resolve(process.cwd(), 'backend/src/db/schema.sql'),
    path.resolve(process.cwd(), 'dist/db/schema.sql'),
  ];
  const schemaPath = possiblePaths.find((p) => fs.existsSync(p)) || possiblePaths[0];

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Migration schema file not found in candidates: ${possiblePaths.join(', ')}`);
  }

  const sql = fs.readFileSync(schemaPath, 'utf-8');

  console.log(`[Migration] Running PostgreSQL schema migrations from ${schemaPath}...`);
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
