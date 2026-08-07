interface WindowState {
  count: number;
  resetAt: number;
}

export class SlidingWindowLimiter {
  private readonly windows = new Map<string, WindowState>();
  constructor(private readonly limit: number, private readonly windowMs = 60_000, private readonly maxKeys = 10_000) {}

  take(key: string, now = Date.now()): { allowed: boolean; retryAfterSeconds: number } {
    const current = this.windows.get(key);
    const next = !current || current.resetAt <= now ? { count: 0, resetAt: now + this.windowMs } : current;
    if (next.count >= this.limit) {
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((next.resetAt - now) / 1_000)) };
    }
    next.count += 1;
    this.windows.set(key, next);
    if (this.windows.size > this.maxKeys) {
      for (const [candidate, state] of this.windows) {
        if (state.resetAt <= now || this.windows.size > this.maxKeys) this.windows.delete(candidate);
        if (this.windows.size <= this.maxKeys) break;
      }
    }
    return { allowed: true, retryAfterSeconds: 0 };
  }
}
