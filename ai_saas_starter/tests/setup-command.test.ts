import { describe, expect, it } from "vitest";
import { buildProvisioningCommand } from "@/lib/setup-command";

describe("buildProvisioningCommand", () => {
  it("uses exact loopback callback URLs and a pinned CLI", () => {
    const command = buildProvisioningCommand("http://127.0.0.1:3000");
    expect(command).toContain("npx manage-tuurio-id@1.1.6 init");
    expect(command).toContain("--base-url http://127.0.0.1:3000");
    expect(command).toContain("--redirect-uri http://127.0.0.1:3000/auth/callback");
    expect(command).toContain("--post-logout-redirect-uri http://127.0.0.1:3000/logout/callback");
  });

  it("accepts an exact production HTTPS origin", () => {
    expect(buildProvisioningCommand("https://canvas.example.com")).toContain("--base-url https://canvas.example.com");
  });

  it("rejects URLs with paths and non-loopback HTTP", () => {
    expect(() => buildProvisioningCommand("https://canvas.example.com/setup")).toThrow(/exact origin/i);
    expect(() => buildProvisioningCommand("http://canvas.example.com")).toThrow(/HTTPS/i);
  });
});
