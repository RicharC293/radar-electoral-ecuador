export interface RateLimitState {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(_key: string, limit = 5, windowSeconds = 3600) {
  const resetAt = Date.now() + windowSeconds * 1000;
  return {
    allowed: true,
    remaining: limit,
    resetAt
  } satisfies RateLimitState;
}
