const Redis = require('ioredis');
const { config } = require('./env');

let hitsCount = 0;
let missesCount = 0;

// --- MemoryCacheClient: in-memory fallback when Redis is unavailable ---

function createMemoryCacheClient() {
  const store = new Map();

  function recordHit() {
    hitsCount++;
  }

  function recordMiss() {
    missesCount++;
  }

  async function get(key) {
    const item = store.get(key);
    if (!item) {
      recordMiss();
      return null;
    }
    if (item.expiresAt && Date.now() > item.expiresAt) {
      store.delete(key);
      recordMiss();
      return null;
    }
    recordHit();
    return item.value;
  }

  async function set(key, value, ttlSeconds) {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    store.set(key, { value, expiresAt });
  }

  async function del(key) {
    store.delete(key);
  }

  async function delByPattern(pattern) {
    const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    let deletedCount = 0;
    for (const key of store.keys()) {
      if (regexPattern.test(key)) {
        store.delete(key);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  async function flush() {
    store.clear();
  }

  function isReady() {
    return true;
  }

  function getClientType() {
    return 'memory-fallback';
  }

  async function getStats() {
    const total = hitsCount + missesCount;
    const hitRate = total === 0 ? '0.0%' : ((hitsCount / total) * 100).toFixed(1) + '%';
    return {
      status: 'fallback',
      type: 'In-Memory Cache (Redis Standby)',
      hits: hitsCount,
      misses: missesCount,
      hitRate,
      keysCount: store.size,
      latencyMs: 0.1,
    };
  }

  return { get, set, del, delByPattern, flush, isReady, getClientType, getStats };
}

// --- RedisCacheClient: wraps a live ioredis connection ---

function createRedisCacheClient(redisInstance) {
  let connected = false;

  redisInstance.on('connect', () => {
    connected = true;
    console.log('[Redis] Connected successfully to Redis server.');
  });

  redisInstance.on('error', (err) => {
    connected = false;
    console.warn(`[Redis] Connection warning: ${err.message}`);
  });

  function recordHit() {
    hitsCount++;
  }

  function recordMiss() {
    missesCount++;
  }

  async function get(key) {
    try {
      const val = await redisInstance.get(key);
      if (val !== null) {
        recordHit();
      } else {
        recordMiss();
      }
      return val;
    } catch {
      recordMiss();
      return null;
    }
  }

  async function set(key, value, ttlSeconds) {
    try {
      if (ttlSeconds) {
        await redisInstance.set(key, value, 'EX', ttlSeconds);
      } else {
        await redisInstance.set(key, value);
      }
    } catch (err) {
      console.warn(`[Redis] Failed to set key ${key}: ${err.message}`);
    }
  }

  async function del(key) {
    try {
      await redisInstance.del(key);
    } catch (err) {
      console.warn(`[Redis] Failed to delete key ${key}: ${err.message}`);
    }
  }

  async function delByPattern(pattern) {
    try {
      const keys = await redisInstance.keys(pattern);
      if (keys.length > 0) {
        await redisInstance.del(...keys);
      }
      return keys.length;
    } catch (err) {
      console.warn(`[Redis] Pattern delete failed: ${err.message}`);
      return 0;
    }
  }

  async function flush() {
    try {
      await redisInstance.flushdb();
    } catch (err) {
      console.warn(`[Redis] Flush failed: ${err.message}`);
    }
  }

  function isReady() {
    return connected && redisInstance.status === 'ready';
  }

  function getClientType() {
    return 'redis';
  }

  async function getStats() {
    const total = hitsCount + missesCount;
    const hitRate = total === 0 ? '0.0%' : ((hitsCount / total) * 100).toFixed(1) + '%';
    const start = Date.now();
    let keysCount = 0;
    try {
      keysCount = await redisInstance.dbsize();
    } catch {
      keysCount = 0;
    }
    const latency = Date.now() - start;

    return {
      status: isReady() ? 'connected' : 'disconnected',
      type: 'Redis Server 7.x',
      hits: hitsCount,
      misses: missesCount,
      hitRate,
      keysCount,
      latencyMs: latency,
    };
  }

  return { get, set, del, delByPattern, flush, isReady, getClientType, getStats };
}

// --- getCache: singleton factory ---

let activeCacheClient = null;

function getCache() {
  if (activeCacheClient) {
    return activeCacheClient;
  }

  // During automated tests without an explicit external Redis instance, use fast in-memory cache
  if (process.env.NODE_ENV === 'test' && !process.env.FORCE_EXTERNAL_REDIS) {
    activeCacheClient = createMemoryCacheClient();
    return activeCacheClient;
  }

  try {
    const redisInstance = new Redis(config.redis.url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy: (times) => {
        if (times > 2) {
          return null; // Stop retrying after 2 attempts, allow fallback
        }
        return 1000;
      },
      lazyConnect: true,
    });

    redisInstance.connect().catch((err) => {
      console.warn(`[Redis] External Redis connection failed (${err.message}). Using in-memory cache.`);
      if (config.redis.useMemoryFallback) {
        activeCacheClient = createMemoryCacheClient();
      }
    });

    activeCacheClient = createRedisCacheClient(redisInstance);
    return activeCacheClient;
  } catch (err) {
    console.warn(`[Redis] Initialization error: ${err.message}. Using in-memory fallback.`);
    activeCacheClient = createMemoryCacheClient();
    return activeCacheClient;
  }
}

module.exports = {
  getCache,
};
