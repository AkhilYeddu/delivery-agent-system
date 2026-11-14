const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config();

const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const isTls = redisUrl.startsWith('rediss://');

let hitsCount = 0;
let missesCount = 0;

const client = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  connectTimeout: 3000,
  lazyConnect: true,
  tls: isTls ? { rejectUnauthorized: false } : undefined,
});

client.on('connect', () => console.log('[Redis] Connected.'));
client.on('error', (err) => console.warn('[Redis] Unavailable, falling back to DB:', err.message));

async function get(key) {
  try {
    const val = await client.get(key);
    if (val !== null) { hitsCount++; return val; }
  } catch {
    // Redis down → return null → service will fetch from PostgreSQL
  }
  missesCount++;
  return null;
}

async function set(key, value, ttlSeconds) {
  try {
    if (ttlSeconds) {
      await client.set(key, value, 'EX', ttlSeconds);
    } else {
      await client.set(key, value);
    }
  } catch {
    // Redis down → silently skip caching
  }
}

async function del(key) {
  try { await client.del(key); } catch {}
}

async function delByPattern(pattern) {
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) await client.del(...keys);
    return keys.length;
  } catch { return 0; }
}

async function flush() {
  try { await client.flushdb(); } catch {}
}

async function getStats() {
  const total = hitsCount + missesCount;
  const hitRate = total === 0 ? '0.0%' : ((hitsCount / total) * 100).toFixed(1) + '%';
  try {
    const keysCount = await client.dbsize();
    return { status: 'connected', type: 'Redis', hits: hitsCount, misses: missesCount, hitRate, keysCount };
  } catch {
    return { status: 'unavailable', type: 'Redis', hits: hitsCount, misses: missesCount, hitRate, keysCount: 0 };
  }
}

async function closeRedis() {
  try { await client.quit(); } catch {}
}

function getCache() {
  return { get, set, del, delByPattern, flush, getStats };
}

module.exports = { getCache, closeRedis };
