const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config();

const Redis = require('ioredis');

const isProduction = process.env.NODE_ENV === 'production';
const hasExplicitRedisUrl = Boolean(process.env.REDIS_URL);
const redisUrl = process.env.REDIS_URL || (isProduction ? null : 'redis://localhost:6379');
const isTls = Boolean(redisUrl && redisUrl.startsWith('rediss://'));

let hitsCount = 0;
let missesCount = 0;
let client = null;

if (redisUrl) {
  try {
    client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      enableOfflineQueue: false, // Prevents hanging when Redis is unreachable
      tls: isTls ? { rejectUnauthorized: false } : undefined,
      retryStrategy(times) {
        if (times > 3) return null; // Avoid infinite reconnect spam
        return 2000;
      },
    });

    client.on('connect', () => console.log('[Redis] Connected to Redis server.'));
    client.on('ready', () => console.log('[Redis] Ready for cache queries.'));
    client.on('error', (err) => {
      if (err.code !== 'ECONNREFUSED' && err.code !== 'ECONNRESET') {
        console.warn('[Redis] Notice:', err.message);
      }
    });
  } catch (err) {
    console.warn('[Redis] Failed to initialize client:', err.message);
    client = null;
  }
} else if (isProduction) {
  console.log('[Redis] Notice: REDIS_URL not configured. Operating in direct PostgreSQL mode.');
}

function isClientReady() {
  return client !== null && client.status === 'ready';
}

async function get(key) {
  if (isClientReady()) {
    try {
      const val = await client.get(key);
      if (val !== null) {
        hitsCount++;
        return val;
      }
    } catch {
      // Fall through to miss on any query failure
    }
  }
  missesCount++;
  return null;
}

async function set(key, value, ttlSeconds) {
  if (!isClientReady()) return;
  try {
    if (ttlSeconds) {
      await client.set(key, value, 'EX', ttlSeconds);
    } else {
      await client.set(key, value);
    }
  } catch {
    // Non-blocking
  }
}

async function del(key) {
  if (!isClientReady()) return;
  try {
    await client.del(key);
  } catch {}
}

async function delByPattern(pattern) {
  if (!isClientReady()) return 0;
  try {
    const keys = await client.keys(pattern);
    if (keys && keys.length > 0) {
      await client.del(...keys);
      return keys.length;
    }
    return 0;
  } catch {
    return 0;
  }
}

async function flush() {
  if (!isClientReady()) return;
  try {
    await client.flushdb();
  } catch {}
}

async function getStats() {
  const total = hitsCount + missesCount;
  const hitRate = total === 0 ? '0.0%' : ((hitsCount / total) * 100).toFixed(1) + '%';
  let keysCount = 0;

  if (isClientReady()) {
    try {
      keysCount = await client.dbsize();
    } catch {
      keysCount = 0;
    }
  }

  return {
    status: isClientReady() ? 'connected' : hasExplicitRedisUrl ? 'connecting' : 'inactive',
    type: isClientReady() ? 'Redis Server' : hasExplicitRedisUrl ? 'Redis (Offline)' : 'PostgreSQL Direct',
    hits: hitsCount,
    misses: missesCount,
    hitRate,
    keysCount,
  };
}

async function closeRedis() {
  if (client) {
    try {
      await client.quit();
    } catch {}
  }
}

function getCache() {
  return { get, set, del, delByPattern, flush, getStats };
}

module.exports = { getCache, closeRedis };
