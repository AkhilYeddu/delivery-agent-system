const fs = require('fs');
const path = require('path');
const { getDb, closeDb } = require('../config/db');

async function runMigrations() {
  const db = await getDb();

  // In-memory PostgreSQL (pg-mem) already initializes schema in getDb()
  if (db.getType() === 'in-memory-postgres') {
    console.log('[Migration] In-memory PostgreSQL engine schema ready.');
    return;
  }

  const possiblePaths = [
    path.resolve(__dirname, 'schema.sql'),
    path.resolve(__dirname, '../db/schema.sql'),
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
    } catch (err) {
      console.error('[Migration] Migration failed:', err.message);
      process.exit(1);
    } finally {
      await closeDb();
      process.exit(0);
    }
  })();
}

module.exports = {
  runMigrations,
};

