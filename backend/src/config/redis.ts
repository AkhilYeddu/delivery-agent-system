import Redis from 'ioredis';
import { config } from './env';

export interface CacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  delByPattern(pattern: string): Promise<number>;
  flush(): Promise<void>;
  isReady(): boolean;
  getClientType(): 'redis' | 'memory-fallback';
  getStats(): Promise<{
    status: 'connected' | 'fallback' | 'disconnected';
    type: string;
    hits: number;
    misses: number;
    hitRate: string;
    keysCount: number;
    latencyMs: number;
  }>;
  recordHit(): void;
  recordMiss(): void;
}

let hitsCount = 0;
let missesCount = 0;

class MemoryCacheClient implements CacheClient {
  private store = new Map<string, { value: string; expiresAt: number | null }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) {
      this.recordMiss();
      return null;
    }
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      this.recordMiss();
      return null;
    }
    this.recordHit();
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async delByPattern(pattern: string): Promise<number> {
    const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    let deletedCount = 0;
    for (const key of this.store.keys()) {
      if (regexPattern.test(key)) {
        this.store.delete(key);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  async flush(): Promise<void> {
    this.store.clear();
  }

  isReady(): boolean {
    return true;
  }

  getClientType(): 'memory-fallback' {
    return 'memory-fallback';
  }

  recordHit(): void {
    hitsCount++;
  }

  recordMiss(): void {
    missesCount++;
  }

  async getStats() {
    const total = hitsCount + missesCount;
    const hitRate = total === 0 ? '0.0%' : ((hitsCount / total) * 100).toFixed(1) + '%';
    return {
      status: 'fallback' as const,
      type: 'In-Memory Cache (Redis Standby)',
      hits: hitsCount,
      misses: missesCount,
      hitRate,
      keysCount: this.store.size,
      latencyMs: 0.1,
    };
  }
}

class RedisCacheClient implements CacheClient {
  private redis: Redis;
  private connected: boolean = false;

  constructor(redis: Redis) {
    this.redis = redis;
    this.redis.on('connect', () => {
      this.connected = true;
      console.log('[Redis] Connected successfully to Redis server.');
    });
    this.redis.on('error', (err) => {
      this.connected = false;
      console.warn(`[Redis] Connection warning: ${err.message}`);
    });
  }

  async get(key: string): Promise<string | null> {
    try {
      const val = await this.redis.get(key);
      if (val !== null) {
        this.recordHit();
      } else {
        this.recordMiss();
      }
      return val;
    } catch {
      this.recordMiss();
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.redis.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.redis.set(key, value);
      }
    } catch (err: any) {
      console.warn(`[Redis] Failed to set key ${key}: ${err.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (err: any) {
      console.warn(`[Redis] Failed to delete key ${key}: ${err.message}`);
    }
  }

  async delByPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return keys.length;
    } catch (err: any) {
      console.warn(`[Redis] Pattern delete failed: ${err.message}`);
      return 0;
    }
  }

  async flush(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch (err: any) {
      console.warn(`[Redis] Flush failed: ${err.message}`);
    }
  }

  isReady(): boolean {
    return this.connected && this.redis.status === 'ready';
  }

  getClientType(): 'redis' {
    return 'redis';
  }

  recordHit(): void {
    hitsCount++;
  }

  recordMiss(): void {
    missesCount++;
  }

  async getStats() {
    const total = hitsCount + missesCount;
    const hitRate = total === 0 ? '0.0%' : ((hitsCount / total) * 100).toFixed(1) + '%';
    const start = Date.now();
    let keysCount = 0;
    try {
      const dbsize = await this.redis.dbsize();
      keysCount = dbsize;
    } catch {
      keysCount = 0;
    }
    const latency = Date.now() - start;

    return {
      status: this.isReady() ? ('connected' as const) : ('disconnected' as const),
      type: 'Redis Server 7.x',
      hits: hitsCount,
      misses: missesCount,
      hitRate,
      keysCount,
      latencyMs: latency,
    };
  }
}

let activeCacheClient: CacheClient | null = null;

export function getCache(): CacheClient {
  if (activeCacheClient) {
    return activeCacheClient;
  }

  // During automated tests without an explicit external Redis instance, use fast in-memory cache
  if (process.env.NODE_ENV === 'test' && !process.env.FORCE_EXTERNAL_REDIS) {
    activeCacheClient = new MemoryCacheClient();
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
        activeCacheClient = new MemoryCacheClient();
      }
    });

    activeCacheClient = new RedisCacheClient(redisInstance);
    return activeCacheClient;
  } catch (err: any) {
    console.warn(`[Redis] Initialization error: ${err.message}. Using in-memory fallback.`);
    activeCacheClient = new MemoryCacheClient();
    return activeCacheClient;
  }
}
