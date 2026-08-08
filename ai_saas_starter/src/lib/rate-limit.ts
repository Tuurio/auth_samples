interface WindowState {
  count: number;
  resetAt: number;
}

export class SlidingWindowLimiter {
  private readonly windows = new Map<string, WindowState>();
  constructor(private readonly limit: number, private readonly windowMs = 60_000, private readonly maxKeys = 10_000) {}

  private prune(now: number) {
    for (const [candidate, state] of this.windows) {
      if (state.resetAt <= now) this.windows.delete(candidate);
    }
    while (this.windows.size > this.maxKeys) {
      const oldest = this.windows.keys().next().value as string | undefined;
      if (!oldest) break;
      this.windows.delete(oldest);
    }
  }

  take(key: string, now = Date.now()): { allowed: boolean; retryAfterSeconds: number } {
    const current = this.windows.get(key);
    const next = !current || current.resetAt <= now ? { count: 0, resetAt: now + this.windowMs } : current;
    if (current) this.windows.delete(key);
    this.windows.set(key, next);
    this.prune(now);
    if (next.count >= this.limit) {
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((next.resetAt - now) / 1_000)) };
    }
    next.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }
}
