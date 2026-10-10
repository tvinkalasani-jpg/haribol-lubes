export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };
export interface RfqRateLimiter { check(fingerprint: string, now?: number): Promise<RateLimitResult>; }

export class InMemoryRfqRateLimiter implements RfqRateLimiter {
  private readonly entries = new Map<string, number[]>();
  constructor(private readonly maximum = 5, private readonly windowMs = 10 * 60 * 1000) {}
  async check(fingerprint: string, now = Date.now()): Promise<RateLimitResult> {
    const recent = (this.entries.get(fingerprint) ?? []).filter((time) => now - time < this.windowMs);
    if (recent.length >= this.maximum) {
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((this.windowMs - (now - (recent[0] ?? now))) / 1000)) };
    }
    recent.push(now); this.entries.set(fingerprint, recent);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}
