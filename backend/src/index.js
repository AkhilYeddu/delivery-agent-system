const { createApp } = require('./app');
const { config } = require('./config/env');
const { getDb } = require('./config/db');
const { getCache } = require('./config/redis');
const { seedSampleAgents } = require('./db/seed');

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

  // Auto-seed if database is currently empty
  try {
    const countCheck = await db.query('SELECT COUNT(*)::int as count FROM delivery_agents');
    const count = countCheck.rows[0]?.count || 0;
    if (count === 0) {
      console.log('[Bootstrap] Database is empty. Seeding realistic sample agents for demonstration...');
      await seedSampleAgents();
      console.log('[Bootstrap] Sample data seeded successfully.');
    }
  } catch (err) {
    console.warn('[Bootstrap] Auto-seed check skipped or failed:', err.message);
  }

  // Start HTTP Server
  const server = app.listen(config.port, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   🚀 Delivery Agent Management System API                                 ║
║                                                                           ║
║   • Local URL:       http://localhost:${config.port}                              ║
║   • Endpoints:       http://localhost:${config.port}/api/agents                    ║
║   • Health & Stats:  http://localhost:${config.port}/api/health                    ║
║   • Cache Telemetry: http://localhost:${config.port}/api/cache/stats               ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n⚠️  [Port Conflict] Port ${config.port} is already in use by another running process.`);
      console.error(`   To free it on Windows, run: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${config.port}).OwningProcess -Force\n`);
    } else {
      console.error('[Server Error]:', err);
    }
    process.exit(1);
  });

  const shutdown = async () => {
    console.log('\n[Server] Gracefully shutting down...');
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

if (require.main === module) {
  bootstrap().catch((err) => {
    console.error('[Bootstrap Error]:', err);
    process.exit(1);
  });
}

module.exports = {
  bootstrap,
};
