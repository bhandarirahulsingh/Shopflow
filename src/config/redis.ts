// src/config/redis.ts
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// 1. Initialize Redis client with auto-reconnect strategy
export const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        // Exponential backoff: retry after 50ms, 100ms, 200ms... up to 2 seconds
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    lazyConnect: false,
});

// 2. Lifecycle event logs
redis.on('connect', () => {
    console.log('⚡ [Redis] Connected successfully to Redis server');
});

redis.on('error', (err) => {
    console.warn('⚠️ [Redis] Connection warning / error:', err.message);
});

// 3. Helper: Safely delete keys matching a pattern (e.g., "products:*")
// WARNING: In production, NEVER use `redis.keys()` because it blocks Redis single-threaded event loop!
// Always use `scan` to paginate through keys safely without freezing the server.
export async function deleteKeysByPattern(pattern: string): Promise<void> {
    try {
        let cursor = '0';
        do {
            const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
            cursor = nextCursor;
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } while (cursor !== '0');
    } catch (err: any) {
        console.warn(`⚠️ [Redis] Failed to clear pattern ${pattern}:`, err.message);
    }
}
