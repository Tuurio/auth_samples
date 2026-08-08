import postgres, { type Sql } from "postgres";
import type {
  AuditEvent,
  Conversation,
  Identity,
  Message,
  UsageIncrement,
  UsageSnapshot,
  WorkspaceStore,
} from "@/lib/domain";
import { cleanTitle, currentPeriod } from "@/lib/storage/shared";

type Row = Record<string, unknown>;

const text = (value: unknown) => String(value);
const iso = (value: unknown) => new Date(value as string | number | Date).toISOString();

function conversationFrom(row: Row): Conversation {
  return {
    id: text(row.id),
    tenantId: text(row.tenant_id),
    ownerSubject: text(row.owner_subject),
    title: text(row.title),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

function messageFrom(row: Row): Message {
  return {
    id: text(row.id),
    tenantId: text(row.tenant_id),
    conversationId: text(row.conversation_id),
    role: row.role === "assistant" ? "assistant" : "user",
    content: text(row.content),
    createdAt: iso(row.created_at),
  };
}

export class PostgresWorkspaceStore implements WorkspaceStore {
  readonly mode = "postgres" as const;
  constructor(private readonly sql: Sql) {}

  async listConversations(identity: Identity): Promise<Conversation[]> {
    const rows = await this.sql`
      SELECT * FROM conversations WHERE tenant_id = ${identity.tenantId} ORDER BY updated_at DESC, id DESC LIMIT 100
    `;
    return rows.map((row) => conversationFrom(row));
  }

  async getConversation(identity: Identity, conversationId: string): Promise<Conversation | null> {
    const rows = await this.sql`SELECT * FROM conversations WHERE id = ${conversationId} AND tenant_id = ${identity.tenantId}`;
    if (!rows[0]) return null;
    const messages = await this.sql`
      SELECT * FROM (
        SELECT * FROM messages
        WHERE conversation_id = ${conversationId} AND tenant_id = ${identity.tenantId}
        ORDER BY created_at DESC, id DESC
        LIMIT 200
      ) AS recent_messages
      ORDER BY created_at ASC, id ASC
    `;
    return { ...conversationFrom(rows[0]), messages: messages.map((row) => messageFrom(row)) };
  }

  async createConversation(identity: Identity, title: string): Promise<Conversation> {
    const id = crypto.randomUUID();
    const rows = await this.sql`
      INSERT INTO conversations (id, tenant_id, owner_subject, title)
      VALUES (${id}, ${identity.tenantId}, ${identity.subject}, ${cleanTitle(title)})
      RETURNING *
    `;
    await this.addAudit(identity, "conversation.created", id);
    return conversationFrom(rows[0]);
  }

  async appendMessage(
    identity: Identity,
    conversationId: string,
    role: Message["role"],
    content: string,
  ): Promise<Message> {
    return this.sql.begin(async (transaction) => {
      const conversations = await transaction`
        SELECT id FROM conversations WHERE id = ${conversationId} AND tenant_id = ${identity.tenantId} FOR UPDATE
      `;
      if (!conversations[0]) throw new Error("CONVERSATION_NOT_FOUND");
      const id = crypto.randomUUID();
      const rows = await transaction`
        INSERT INTO messages (id, tenant_id, conversation_id, role, content)
        VALUES (${id}, ${identity.tenantId}, ${conversationId}, ${role}, ${content})
        RETURNING *
      `;
      await transaction`UPDATE conversations SET updated_at = NOW() WHERE id = ${conversationId} AND tenant_id = ${identity.tenantId}`;
      return messageFrom(rows[0]);
    });
  }

  async deleteConversation(identity: Identity, conversationId: string): Promise<boolean> {
    const rows = await this.sql`
      DELETE FROM conversations WHERE id = ${conversationId} AND tenant_id = ${identity.tenantId} RETURNING id
    `;
    if (!rows[0]) return false;
    await this.addAudit(identity, "conversation.deleted", conversationId);
    return true;
  }

  async getUsage(identity: Identity, limit: number): Promise<UsageSnapshot> {
    const period = currentPeriod();
    const rows = await this.sql`
      SELECT input_units, output_units, request_count FROM monthly_usage
      WHERE tenant_id = ${identity.tenantId} AND period = ${period}
    `;
    const row = rows[0];
    return {
      period,
      inputUnits: Number(row?.input_units ?? 0),
      outputUnits: Number(row?.output_units ?? 0),
      requestCount: Number(row?.request_count ?? 0),
      limit,
    };
  }

  async consumeUsage(identity: Identity, increment: UsageIncrement, limit: number): Promise<UsageSnapshot | null> {
    const period = currentPeriod();
    const rows = await this.sql`
      INSERT INTO monthly_usage (tenant_id, period, input_units, output_units, request_count)
      VALUES (${identity.tenantId}, ${period}, ${increment.inputUnits}, ${increment.outputUnits}, 1)
      ON CONFLICT (tenant_id, period) DO UPDATE SET
        input_units = monthly_usage.input_units + EXCLUDED.input_units,
        output_units = monthly_usage.output_units + EXCLUDED.output_units,
        request_count = monthly_usage.request_count + 1
      WHERE monthly_usage.input_units + monthly_usage.output_units + EXCLUDED.input_units + EXCLUDED.output_units <= ${limit}
      RETURNING input_units, output_units, request_count
    `;
    if (!rows[0]) return null;
    return {
      period,
      inputUnits: Number(rows[0].input_units),
      outputUnits: Number(rows[0].output_units),
      requestCount: Number(rows[0].request_count),
      limit,
    };
  }

  async refundUsage(identity: Identity, decrement: UsageIncrement, decrementRequestCount = false): Promise<void> {
    const period = currentPeriod();
    await this.sql`
      UPDATE monthly_usage SET
        input_units = GREATEST(0, input_units - ${decrement.inputUnits}),
        output_units = GREATEST(0, output_units - ${decrement.outputUnits}),
        request_count = GREATEST(0, request_count - ${decrementRequestCount ? 1 : 0})
      WHERE tenant_id = ${identity.tenantId} AND period = ${period}
    `;
  }

  async addAudit(identity: Identity, action: string, targetId?: string): Promise<void> {
    await this.sql`
      INSERT INTO audit_events (id, tenant_id, actor_subject, action, target_id)
      VALUES (${crypto.randomUUID()}, ${identity.tenantId}, ${identity.subject}, ${action}, ${targetId ?? null})
    `;
  }

  async listAudit(identity: Identity, limit = 50): Promise<AuditEvent[]> {
    if (identity.role !== "admin") throw new Error("ADMIN_REQUIRED");
    const bounded = Math.min(Math.max(limit, 1), 100);
    const rows = await this.sql`
      SELECT * FROM audit_events WHERE tenant_id = ${identity.tenantId} ORDER BY created_at DESC LIMIT ${bounded}
    `;
    return rows.map((row) => ({
      id: text(row.id),
      tenantId: text(row.tenant_id),
      actorSubject: text(row.actor_subject),
      action: text(row.action),
      targetId: row.target_id == null ? null : text(row.target_id),
      createdAt: iso(row.created_at),
    }));
  }
}

export function createPostgresStore(databaseUrl: string): PostgresWorkspaceStore {
  return new PostgresWorkspaceStore(postgres(databaseUrl, { max: 10, idle_timeout: 20 }));
}
