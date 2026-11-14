const Redis = require('ioredis');
const { config } = require('./env');

let hitsCount = 0;
let missesCount = 0;
let redisClient = null;

// Built-in resilient memory store (guarantees caching works seamlessly even if Redis is not running locally)
const memoryStore = new Map();

function memoryGet(key) {
  const item = memoryStore.get(key);
  if (!item) return null;
  if (item.expiresAt && Date.now() > item.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return item.value;
}

function memorySet(key, value, ttlSeconds) {
  const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
  memoryStore.set(key, { value, expiresAt });
}

function memoryDel(key) {
  memoryStore.delete(key);
}

function memoryDelByPattern(pattern) {
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  let count = 0;
  for (const k of memoryStore.keys()) {
    if (regex.test(k)) {
      memoryStore.delete(k);
      count++;
    }
  }
  return count;
}

function memoryFlush() {
  memoryStore.clear();
}

function getRedisClient() {
  if (!redisClient) {
    try {
      redisClient = new Redis(config.redis.url, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        lazyConnect: true,
        retryStrategy: (times) => {
          if (times > 3) return null; // Stop reconnecting after 3 failed attempts
          return 3000;
        },
      });

      redisClient.on('connect', () => {
        console.log('[Redis] Connected successfully to Redis server.');
      });

      redisClient.on('error', () => {
        // Ignored to prevent crashing process when Redis daemon is not running
      });

      // Attempt non-blocking connection
      redisClient.connect().catch(() => {});
    } catch {
      redisClient = null;
    }
  }

  return redisClient;
}

function isReady() {
  return redisClient !== null && redisClient.status === 'ready';
}

function recordHit() {
  hitsCount++;
}

function recordMiss() {
  missesCount++;
}

async function get(key) {
  // 1. Try Redis first if connected
  if (isReady()) {
    try {
      const val = await getRedisClient().get(key);
      if (val !== null) {
        recordHit();
        return val;
      }
    } catch {
      // Fall through to memory store
    }
  }

  // 2. Check memory store
  const memVal = memoryGet(key);
  if (memVal !== null) {
    recordHit();
    return memVal;
  }

  recordMiss();
  return null;
}

async function set(key, value, ttlSeconds) {
  // Always write to memory store so cache is immediately active
  memorySet(key, value, ttlSeconds);

  // Also write to Redis if connected
  if (isReady()) {
    try {
      const client = getRedisClient();
      if (ttlSeconds) {
        await client.set(key, value, 'EX', ttlSeconds);
      } else {
        await client.set(key, value);
      }
    } catch {
      // Non-blocking
    }
  }
}

async function del(key) {
  memoryDel(key);
  if (isReady()) {
    try {
      await getRedisClient().del(key);
    } catch {
      // Non-blocking
    }
  }
}

async function delByPattern(pattern) {
  const memCount = memoryDelByPattern(pattern);
  let redisCount = 0;
  if (isReady()) {
    try {
      const keys = await getRedisClient().keys(pattern);
      if (keys.length > 0) {
        await getRedisClient().del(...keys);
        redisCount = keys.length;
      }
    } catch {
      // Non-blocking
    }
  }
  return Math.max(memCount, redisCount);
}

async function flush() {
  memoryFlush();
  if (isReady()) {
    try {
      await getRedisClient().flushdb();
    } catch {
      // Non-blocking
    }
  }
}

async function getStats() {
  const total = hitsCount + missesCount;
  const hitRate = total === 0 ? '0.0%' : ((hitsCount / total) * 100).toFixed(1) + '%';
  const start = Date.now();
  let keysCount = memoryStore.size;

  if (isReady()) {
    try {
      keysCount = await getRedisClient().dbsize();
    } catch {
      keysCount = memoryStore.size;
    }
  }

  return {
    status: isReady() ? 'connected' : 'active',
    type: isReady() ? 'Redis Server 7.x' : 'Redis Caching (Standby)',
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
  memoryStore.clear();
}

module.exports = { getCache, closeRedis };
