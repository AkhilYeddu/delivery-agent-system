const Redis = require('ioredis');
const { config } = require('./env');

let hitsCount = 0;
let missesCount = 0;
let redisClient = null;

function getRedisClient() {
  if (!redisClient) {
    redisClient = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      retryStrategy: (times) => Math.min(times * 500, 3000),
      lazyConnect: false,
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully to Redis server.');
    });

    redisClient.on('error', (err) => {
      console.error(`[Redis] Connection error: ${err.message}`);
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
  } catch (err) {
    console.warn(`[Redis] get failed for key "${key}": ${err.message}`);
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
  } catch (err) {
    console.warn(`[Redis] set failed for key "${key}": ${err.message}`);
  }
}

async function del(key) {
  try {
    await getRedisClient().del(key);
  } catch (err) {
    console.warn(`[Redis] del failed for key "${key}": ${err.message}`);
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
  } catch (err) {
    console.warn(`[Redis] delByPattern failed for pattern "${pattern}": ${err.message}`);
    return 0;
  }
}

async function flush() {
  try {
    await getRedisClient().flushdb();
  } catch (err) {
    console.warn(`[Redis] flush failed: ${err.message}`);
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
    keysCount = await getRedisClient().dbsize();
  } catch {
    keysCount = 0;
  }

  return {
    status: isReady() ? 'connected' : 'connecting',
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
    await redisClient.quit();
    redisClient = null;
  }
}

module.exports = { getCache, closeRedis };
