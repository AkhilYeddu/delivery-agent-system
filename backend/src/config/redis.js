const Redis = require('ioredis');
const { config } = require('./env');

let hitsCount = 0;
let missesCount = 0;
let redisClient = null;

function getRedisClient() {
  if (!redisClient) {
    redisClient = new Redis(config.redis.url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      enableOfflineQueue: false,
      retryStrategy: (times) => {
        if (times > 3) return null; // Stop reconnect retries if Redis is not running
        return 2000;
      },
      lazyConnect: false,
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully to Redis server.');
    });

    redisClient.on('error', (err) => {
      // Log connection error without crashing the process
      if (err.code !== 'ECONNREFUSED') {
        console.warn(`[Redis] Notice: ${err.message || err.code}`);
      }
    });
  }

  return redisClient;
}

function recordHit() {
  hitsCount++;
}

function recordMiss() {
  missesCount++;
}

async function get(key) {
  try {
    const val = await getRedisClient().get(key);
    if (val !== null) {
      recordHit();
    } else {
      recordMiss();
    }
    return val;
  } catch (_err) {
    recordMiss();
    return null;
  }
}

async function set(key, value, ttlSeconds) {
  try {
    const client = getRedisClient();
    if (ttlSeconds) {
      await client.set(key, value, 'EX', ttlSeconds);
    } else {
      await client.set(key, value);
    }
  } catch (_err) {
    // Non-blocking cache write failure
  }
}

async function del(key) {
  try {
    await getRedisClient().del(key);
  } catch (_err) {
    // Non-blocking
  }
}

async function delByPattern(pattern) {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
    return keys.length;
  } catch (_err) {
    return 0;
  }
}

async function flush() {
  try {
    await getRedisClient().flushdb();
  } catch (_err) {
    // Non-blocking
  }
}

function isReady() {
  return redisClient !== null && redisClient.status === 'ready';
}

async function getStats() {
  const total = hitsCount + missesCount;
  const hitRate = total === 0 ? '0.0%' : ((hitsCount / total) * 100).toFixed(1) + '%';
  const start = Date.now();
  let keysCount = 0;
  try {
    if (isReady()) {
      keysCount = await getRedisClient().dbsize();
    }
  } catch {
    keysCount = 0;
  }

  return {
    status: isReady() ? 'connected' : 'disconnected',
    type: 'Redis Server 7.x',
    hits: hitsCount,
    misses: missesCount,
    hitRate,
    keysCount,
    latencyMs: Date.now() - start,
  };
}

function getCache() {
  return { get, set, del, delByPattern, flush, isReady, getStats };
}

async function closeRedis() {
  if (redisClient) {
    await redisClient.quit().catch(() => {});
    redisClient = null;
  }
}

module.exports = { getCache, closeRedis };
