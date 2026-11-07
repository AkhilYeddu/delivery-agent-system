import { createApp } from './app';
import { config } from './config/env';
import { getDb } from './config/db';
import { getCache } from './config/redis';
import { seedSampleAgents } from './db/seed';
import { runMigrations } from './db/migrate';

async function bootstrap() {
  const app = createApp();

  // Initialize DB and Cache connections
  console.log('[Bootstrap] Initializing database and cache connections...');
  const db = await getDb();
  const dbHealth = await db.checkHealth();
  console.log(`[Bootstrap] Database ready: ${dbHealth.type} (Latency: ${dbHealth.latencyMs}ms)`);

  const cache = getCache();
  const cacheStats = await cache.getStats();
  console.log(`[Bootstrap] Cache ready: ${cacheStats.type} (Status: ${cacheStats.status})`);

  // Auto-run schema migrations
  try {
    console.log('[Bootstrap] Checking / applying database migrations...');
    await runMigrations();
  } catch (err: any) {
    console.warn('[Bootstrap] Migration check note:', err.message);
  }

  // Auto-seed if database is currently empty
  try {
    const countCheck = await db.query('SELECT COUNT(*)::int as count FROM delivery_agents');
    const count = countCheck.rows[0]?.count || 0;
    if (count === 0) {
      console.log('[Bootstrap] Database is empty. Seeding realistic sample agents for demonstration...');
      await seedSampleAgents();
      console.log('[Bootstrap] Sample data seeded successfully.');
    }
  } catch (err: any) {
    console.warn('[Bootstrap] Auto-seed check skipped or failed:', err.message);
  }

  // Start HTTP Server
  const server = app.listen(config.port, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   🚀 Delivery Agent Management System API                                 ║
║                                                                           ║
║   • Local URL:      http://localhost:${config.port}                              ║
║   • Endpoints:      http://localhost:${config.port}/api/agents                    ║
║   • Health & Stats: http://localhost:${config.port}/api/health                    ║
║   • Cache Telemetry:http://localhost:${config.port}/api/cache/stats               ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
  });

  const shutdown = async () => {
    console.log('\n[Server] Gracefully shutting down...');
    server.close(() => {
      console.log('[Server] HTTP connections closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((err) => {
  console.error('[Bootstrap] Fatal startup error:', err);
  process.exit(1);
});

