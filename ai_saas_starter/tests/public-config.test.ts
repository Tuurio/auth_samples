import { describe, expect, it } from "vitest";
import { selectTarget, validatePublicConfig } from "@/lib/auth/public-config";

const config = {
  version: 1,
  issuer: "https://example.id.tuurio.com",
  clientId: "public-client",
  scope: "openid profile email",
  targets: [{
    role: "production",
    deploymentBaseUrl: "https://app.example.com",
    redirectUri: "https://app.example.com/auth/callback",
    postLogoutRedirectUri: "https://app.example.com/logout/callback",
  }],
};

describe("public OIDC configuration", () => {
  it("selects exactly one target for the active origin", () => {
    expect(selectTarget("https://app.example.com", config).role).toBe("production");
  });

  it("fails closed for missing and duplicate origins", () => {
    expect(() => selectTarget("https://other.example.com", config)).toThrow(/found 0/);
    expect(() => selectTarget("https://app.example.com", { ...config, targets: [...config.targets, ...config.targets] })).toThrow(/found 2/);
  });

  it("rejects callbacks on another origin and cleartext production", () => {
    expect(() => validatePublicConfig({ ...config, targets: [{ ...config.targets[0], redirectUri: "https://evil.example/auth/callback" }] })).toThrow(/callbacks/);
    expect(() => validatePublicConfig({ ...config, targets: [{ ...config.targets[0], deploymentBaseUrl: "http://app.example.com" }] })).toThrow(/HTTPS/);
  });

  it("contains no client-secret field", () => {
    expect(JSON.stringify(validatePublicConfig(config))).not.toMatch(/client.?secret/i);
  });
});
