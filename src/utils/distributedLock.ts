// src/utils/distributedLock.ts
import { redis } from '../config/redis';
import { ApiError } from './ApiError';
import crypto from 'crypto';

// 1. Atomic Lua script: Release the lock ONLY if the token matches the owner!
const RELEASE_LOCK_LUA_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
`;

export interface LockOptions {
    ttlMs?: number;        // How long to hold the lock before auto-expiry (default: 5000ms)
    retryCount?: number;   // Number of retries before giving up (default: 0)
    retryDelayMs?: number; // Delay between retries in milliseconds (default: 50ms)
}

/**
 * 🔒 withDistributedLock: Runs any async business function protected by a Redis Distributed Lock.
 *
 * @param lockKey  - Unique resource name (e.g., `checkout:user:123` or `product:42`)
 * @param action   - The async function to execute while holding the lock
 * @param options  - Optional TTL and retry configurations
 */
export async function withDistributedLock<T>(
    lockKey: string,
    action: () => Promise<T>,
    options: LockOptions = {}
): Promise<T> {
    const { ttlMs = 5000, retryCount = 0, retryDelayMs = 50 } = options;
    const lockToken = crypto.randomUUID(); // Unique owner fingerprint
    const fullKey = `lock:${lockKey}`;

    let acquired = false;
    let attempts = 0;

    // Step A: Attempt to acquire the lock (with optional retry loop)
    while (attempts <= retryCount) {
        const result = await redis.set(fullKey, lockToken, 'PX', ttlMs, 'NX');
        if (result === 'OK') {
            acquired = true;
            break;
        }

        attempts++;
        if (attempts <= retryCount) {
            await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        }
    }

    // If another request is currently holding the lock, reject gracefully:
    if (!acquired) {
        throw ApiError.conflict(
            'This item is currently being processed by another request. Please try again in a moment.'
        );
    }

    // Step B: Run the critical business logic
    try {
        return await action();
    } finally {
        // Step C: ALWAYS release the lock in the finally block (even if errors occurred!)
        try {
            await redis.eval(RELEASE_LOCK_LUA_SCRIPT, 1, fullKey, lockToken);
        } catch (err: any) {
            console.warn(`⚠️ [DistributedLock] Failed to release lock for ${fullKey}:`, err.message);
        }
    }
}
