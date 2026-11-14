const { createApp } = require('./app');
const { config } = require('./config/env');
const { getDb, closeDb } = require('./config/db');
const { getCache, closeRedis } = require('./config/redis');

async function bootstrap() {
  const app = createApp();

  // Verify DB connection on startup
  console.log('[Bootstrap] Checking PostgreSQL connection...');
  const db = await getDb();
  const dbHealth = await db.checkHealth();
  if (!dbHealth.isConnected) {
    console.warn(`\n⚠️  [Database Notice] Could not reach PostgreSQL (${dbHealth.error}).`);
    console.warn(`   Target URL: ${config.database.url}`);
    console.warn('   The HTTP API server will still start, but database operations will return 503 until PostgreSQL is reachable.\n');
  } else {
    console.log(`[Bootstrap] Database ready: ${dbHealth.type} (Latency: ${dbHealth.latencyMs}ms)`);
  }

  // Verify Redis connection on startup
  console.log('[Bootstrap] Checking Redis connection...');
  const cache = getCache();
  const cacheStats = await cache.getStats();
  console.log(`[Bootstrap] Cache status: ${cacheStats.type} (${cacheStats.status})`);

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
      await closeDb();
      await closeRedis();
      console.log('[Server] Connections closed. Goodbye.');
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

module.exports = { bootstrap };
