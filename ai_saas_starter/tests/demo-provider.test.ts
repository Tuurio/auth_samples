import { describe, expect, it } from "vitest";
import { DemoAiProvider } from "@/lib/ai/demo";

describe("DemoAiProvider", () => {
  it("labels local deterministic output and makes no network request", async () => {
    const provider = new DemoAiProvider();
    let output = "";
    for await (const chunk of provider.stream({ messages: [{ role: "user", content: "launch plan" }] })) output += chunk;
    expect(output).toContain("no prompt was sent to an external AI provider");
    expect(output).toContain("launch plan");
  });
});
