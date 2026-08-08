import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Identity } from "@/lib/domain";
import { PostgresWorkspaceStore } from "@/lib/storage/postgres";

const databaseUrl = process.env.TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;
const sql = databaseUrl ? postgres(databaseUrl, { max: 3 }) : null;
const store = sql ? new PostgresWorkspaceStore(sql) : null;
const identity = (tenantId: string, role: Identity["role"] = "admin"): Identity => ({ tenantId, subject: `subject-${tenantId}`, email: null, name: null, role });

suite("PostgresWorkspaceStore", () => {
  beforeAll(async () => {
    await sql!.unsafe(readFileSync(resolve(process.cwd(), "db/schema.sql"), "utf8"));
  });

  afterAll(async () => {
    await sql!`TRUNCATE messages, conversations, monthly_usage, audit_events CASCADE`;
    await sql!.end();
  });

  it("keeps persisted content isolated and usage updates atomic", async () => {
    const alpha = identity("https://alpha.id.tuurio.com");
    const beta = identity("https://beta.id.tuurio.com");
    const conversation = await store!.createConversation(alpha, "Persistent plan");
    await store!.appendMessage(alpha, conversation.id, "user", "Only alpha can read this");
    expect((await store!.getConversation(alpha, conversation.id))?.messages).toHaveLength(1);
    expect(await store!.getConversation(beta, conversation.id)).toBeNull();
    expect(await store!.consumeUsage(alpha, { inputUnits: 4, outputUnits: 5 }, 10)).not.toBeNull();
    expect(await store!.consumeUsage(alpha, { inputUnits: 1, outputUnits: 1 }, 10)).toBeNull();
    await store!.refundUsage(alpha, { inputUnits: 0, outputUnits: 5 });
    expect(await store!.consumeUsage(alpha, { inputUnits: 1, outputUnits: 1 }, 10)).not.toBeNull();
    await store!.refundUsage(alpha, { inputUnits: 1, outputUnits: 1 }, true);
    expect(await store!.getUsage(alpha, 10)).toMatchObject({ inputUnits: 4, outputUnits: 0, requestCount: 1 });
    expect((await store!.getUsage(beta, 10)).requestCount).toBe(0);
  });

  it("bounds conversation and message history returned to clients", async () => {
    const bounded = identity("https://bounded.id.tuurio.com");
    let latest = await store!.createConversation(bounded, "Conversation 0");
    for (let index = 1; index <= 100; index += 1) {
      latest = await store!.createConversation(bounded, `Conversation ${index}`);
    }
    for (let index = 0; index < 201; index += 1) {
      await store!.appendMessage(bounded, latest.id, "user", `Message ${index}`);
    }

    expect(await store!.listConversations(bounded)).toHaveLength(100);
    const messages = (await store!.getConversation(bounded, latest.id))?.messages ?? [];
    expect(messages).toHaveLength(200);
    expect(messages[0]?.content).toBe("Message 1");
  });
});
