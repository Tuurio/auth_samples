import { describe, expect, it } from "vitest";
import { identityFromClaims } from "@/lib/auth/server";
import { SlidingWindowLimiter } from "@/lib/rate-limit";

describe("security boundaries", () => {
  it("derives tenant scope only from the validated issuer", () => {
    const identity = identityFromClaims({ iss: "https://tenant.id.tuurio.com", sub: "subject", email: "person@example.com", permissions: ["org:tenant:write"] });
    expect(identity).toMatchObject({ tenantId: "https://tenant.id.tuurio.com", subject: "subject", role: "admin" });
  });

  it("does not grant admin for unrelated claims", () => {
    expect(identityFromClaims({ iss: "issuer", sub: "subject", roles: ["reader"] }).role).toBe("member");
  });

  it("limits each identity and exposes a bounded retry delay", () => {
    const limiter = new SlidingWindowLimiter(2, 1_000);
    expect(limiter.take("tenant:user", 10).allowed).toBe(true);
    expect(limiter.take("tenant:user", 20).allowed).toBe(true);
    expect(limiter.take("tenant:user", 30)).toEqual({ allowed: false, retryAfterSeconds: 1 });
    expect(limiter.take("tenant:user", 1_020).allowed).toBe(true);
  });
});
