const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend folder or project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/delivery_db',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttlList: parseInt(process.env.REDIS_CACHE_TTL_LIST || '300', 10),
    ttlDetail: parseInt(process.env.REDIS_CACHE_TTL_DETAIL || '600', 10),
    ttlStats: parseInt(process.env.REDIS_CACHE_TTL_STATS || '180', 10),
  },
};

module.exports = { config };
