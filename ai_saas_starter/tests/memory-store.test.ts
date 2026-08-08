import { describe, expect, it } from "vitest";
import type { Identity } from "@/lib/domain";
import { MemoryWorkspaceStore } from "@/lib/storage/memory";

const member = (tenantId: string, role: Identity["role"] = "member"): Identity => ({ tenantId, subject: `user-${tenantId}`, email: null, name: null, role });

describe("MemoryWorkspaceStore", () => {
  it("isolates conversations, messages, usage, and audit by tenant", async () => {
    const store = new MemoryWorkspaceStore();
    const alpha = member("https://alpha.id.tuurio.com", "admin");
    const beta = member("https://beta.id.tuurio.com", "admin");
    const conversation = await store.createConversation(alpha, "  Product   plan  ");
    await store.appendMessage(alpha, conversation.id, "user", "Hello");
    await store.consumeUsage(alpha, { inputUnits: 3, outputUnits: 5 }, 100);

    expect((await store.getConversation(alpha, conversation.id))?.messages).toHaveLength(1);
    expect(await store.getConversation(beta, conversation.id)).toBeNull();
    expect(await store.listConversations(beta)).toEqual([]);
    expect((await store.getUsage(beta, 100)).requestCount).toBe(0);
    expect(await store.listAudit(beta)).toEqual([]);
  });

  it("enforces quotas atomically and authorizes audit access", async () => {
    const store = new MemoryWorkspaceStore();
    const identity = member("tenant");
    expect(await store.consumeUsage(identity, { inputUnits: 4, outputUnits: 5 }, 10)).not.toBeNull();
    expect(await store.consumeUsage(identity, { inputUnits: 1, outputUnits: 1 }, 10)).toBeNull();
    await store.refundUsage(identity, { inputUnits: 0, outputUnits: 5 });
    expect(await store.consumeUsage(identity, { inputUnits: 1, outputUnits: 1 }, 10)).not.toBeNull();
    await store.refundUsage(identity, { inputUnits: 1, outputUnits: 1 }, true);
    expect(await store.getUsage(identity, 10)).toMatchObject({ inputUnits: 4, outputUnits: 0, requestCount: 1 });
    await expect(store.listAudit(identity)).rejects.toThrow("ADMIN_REQUIRED");
  });

  it("deletes only within the validated tenant", async () => {
    const store = new MemoryWorkspaceStore();
    const alpha = member("alpha");
    const beta = member("beta");
    const conversation = await store.createConversation(alpha, "Delete me");
    expect(await store.deleteConversation(beta, conversation.id)).toBe(false);
    expect(await store.deleteConversation(alpha, conversation.id)).toBe(true);
    expect(await store.getConversation(alpha, conversation.id)).toBeNull();
  });

  it("bounds conversation and message history returned to clients", async () => {
    const store = new MemoryWorkspaceStore();
    const identity = member("bounded");
    let latest = await store.createConversation(identity, "Conversation 0");
    for (let index = 1; index <= 100; index += 1) {
      latest = await store.createConversation(identity, `Conversation ${index}`);
    }
    for (let index = 0; index < 201; index += 1) {
      await store.appendMessage(identity, latest.id, "user", `Message ${index}`);
    }

    expect(await store.listConversations(identity)).toHaveLength(100);
    const messages = (await store.getConversation(identity, latest.id))?.messages ?? [];
    expect(messages).toHaveLength(200);
    expect(messages[0]?.content).toBe("Message 1");
  });
});
