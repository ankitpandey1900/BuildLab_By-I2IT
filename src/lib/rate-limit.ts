/**
 * In-memory sliding-window rate limiter for sensitive administrative actions.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Checks if a key has exceeded the specified number of calls within the window.
 *
 * @param key Identifier for the rate-limit scope (e.g. `role-change:${adminId}:${targetUserId}`)
 * @param limit Maximum number of allowed requests within the window
 * @param windowMs Window duration in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(key) ?? { timestamps: [] };

  // Filter timestamps within the current sliding window
  const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (validTimestamps.length >= limit) {
    const oldestTimestamp = validTimestamps[0];
    const resetSeconds = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));

    return {
      success: false,
      limit,
      remaining: 0,
      resetSeconds,
    };
  }

  validTimestamps.push(now);
  rateLimitStore.set(key, { timestamps: validTimestamps });

  // Periodic cleanup if the store grows large
  if (rateLimitStore.size > 1000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.timestamps.every((ts) => now - ts >= windowMs)) {
        rateLimitStore.delete(k);
      }
    }
  }

  return {
    success: true,
    limit,
    remaining: limit - validTimestamps.length,
    resetSeconds: Math.ceil(windowMs / 1000),
  };
}

