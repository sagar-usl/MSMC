import "server-only";

interface Bucket {
  count: number;
  resetAt: number;
}

// One process, one Map — in dev, Next.js hot-reloads modules on every save,
// which would otherwise reset every bucket. Same globalThis-stash pattern as
// prisma.ts. Good enough for a single-instance deployment; resets on
// restart, and doesn't coordinate across instances if ever scaled out.
const globalForRateLimit = globalThis as unknown as { rateLimitBuckets?: Map<string, Bucket> };
const buckets = globalForRateLimit.rateLimitBuckets ?? new Map<string, Bucket>();
if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.rateLimitBuckets = buckets;
}

/**
 * Basic fixed-window rate limiter. Returns true when `key` has exceeded
 * `limit` requests within the current `windowMs` window and should be
 * rejected.
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}

/** Best-effort caller IP from proxy headers; "unknown" when running with no proxy in front (e.g. local dev). */
export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
