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

interface UsageRecord {
  inputUnits: number;
  outputUnits: number;
  requestCount: number;
}

export class MemoryWorkspaceStore implements WorkspaceStore {
  readonly mode = "memory" as const;
  private readonly conversations = new Map<string, Conversation>();
  private readonly messages = new Map<string, Message[]>();
  private readonly usage = new Map<string, UsageRecord>();
  private readonly audit: AuditEvent[] = [];

  async listConversations(identity: Identity): Promise<Conversation[]> {
    return [...this.conversations.values()]
      .filter((conversation) => conversation.tenantId === identity.tenantId)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map((conversation) => ({ ...conversation }));
  }

  async getConversation(identity: Identity, conversationId: string): Promise<Conversation | null> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation || conversation.tenantId !== identity.tenantId) return null;
    return {
      ...conversation,
      messages: (this.messages.get(conversationId) ?? []).map((message) => ({ ...message })),
    };
  }

  async createConversation(identity: Identity, title: string): Promise<Conversation> {
    const now = new Date().toISOString();
    const conversation: Conversation = {
      id: crypto.randomUUID(),
      tenantId: identity.tenantId,
      ownerSubject: identity.subject,
      title: cleanTitle(title),
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.set(conversation.id, conversation);
    await this.addAudit(identity, "conversation.created", conversation.id);
    return { ...conversation };
  }

  async appendMessage(
    identity: Identity,
    conversationId: string,
    role: Message["role"],
    content: string,
  ): Promise<Message> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation || conversation.tenantId !== identity.tenantId) throw new Error("CONVERSATION_NOT_FOUND");
    const message: Message = {
      id: crypto.randomUUID(),
      tenantId: identity.tenantId,
      conversationId,
      role,
      content,
      createdAt: new Date().toISOString(),
    };
    this.messages.set(conversationId, [...(this.messages.get(conversationId) ?? []), message]);
    conversation.updatedAt = message.createdAt;
    return { ...message };
  }

  async deleteConversation(identity: Identity, conversationId: string): Promise<boolean> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation || conversation.tenantId !== identity.tenantId) return false;
    this.conversations.delete(conversationId);
    this.messages.delete(conversationId);
    await this.addAudit(identity, "conversation.deleted", conversationId);
    return true;
  }

  async getUsage(identity: Identity, limit: number): Promise<UsageSnapshot> {
    const period = currentPeriod();
    const record = this.usage.get(`${identity.tenantId}:${period}`) ?? {
      inputUnits: 0,
      outputUnits: 0,
      requestCount: 0,
    };
    return { period, ...record, limit };
  }

  async consumeUsage(identity: Identity, increment: UsageIncrement, limit: number): Promise<UsageSnapshot | null> {
    const period = currentPeriod();
    const key = `${identity.tenantId}:${period}`;
    const current = this.usage.get(key) ?? { inputUnits: 0, outputUnits: 0, requestCount: 0 };
    if (current.inputUnits + current.outputUnits + increment.inputUnits + increment.outputUnits > limit) return null;
    const next = {
      inputUnits: current.inputUnits + increment.inputUnits,
      outputUnits: current.outputUnits + increment.outputUnits,
      requestCount: current.requestCount + 1,
    };
    this.usage.set(key, next);
    return { period, ...next, limit };
  }

  async addAudit(identity: Identity, action: string, targetId?: string): Promise<void> {
    this.audit.unshift({
      id: crypto.randomUUID(),
      tenantId: identity.tenantId,
      actorSubject: identity.subject,
      action,
      targetId: targetId ?? null,
      createdAt: new Date().toISOString(),
    });
    if (this.audit.length > 1_000) this.audit.length = 1_000;
  }

  async listAudit(identity: Identity, limit = 50): Promise<AuditEvent[]> {
    if (identity.role !== "admin") throw new Error("ADMIN_REQUIRED");
    return this.audit
      .filter((event) => event.tenantId === identity.tenantId)
      .slice(0, Math.min(Math.max(limit, 1), 100))
      .map((event) => ({ ...event }));
  }
}
