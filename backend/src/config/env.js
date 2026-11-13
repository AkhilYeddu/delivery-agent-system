const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend folder or root folder
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/delivery_db',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'delivery_db',
    usePgliteFallback: process.env.USE_PGLITE_FALLBACK !== 'false',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    ttlList: parseInt(process.env.REDIS_CACHE_TTL_LIST || '300', 10),
    ttlDetail: parseInt(process.env.REDIS_CACHE_TTL_DETAIL || '600', 10),
    ttlStats: parseInt(process.env.REDIS_CACHE_TTL_STATS || '180', 10),
    useMemoryFallback: process.env.USE_MEMORY_CACHE_FALLBACK !== 'false',
  },
};

module.exports = { config };
