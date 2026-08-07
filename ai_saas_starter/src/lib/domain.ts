export type WorkspaceRole = "member" | "admin";

export interface Identity {
  tenantId: string;
  subject: string;
  email: string | null;
  name: string | null;
  role: WorkspaceRole;
}

export interface Message {
  id: string;
  tenantId: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  tenantId: string;
  ownerSubject: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface UsageSnapshot {
  period: string;
  inputUnits: number;
  outputUnits: number;
  requestCount: number;
  limit: number;
}

export interface AuditEvent {
  id: string;
  tenantId: string;
  actorSubject: string;
  action: string;
  targetId: string | null;
  createdAt: string;
}

export interface UsageIncrement {
  inputUnits: number;
  outputUnits: number;
}

export interface WorkspaceStore {
  readonly mode: "memory" | "postgres";
  listConversations(identity: Identity): Promise<Conversation[]>;
  getConversation(identity: Identity, conversationId: string): Promise<Conversation | null>;
  createConversation(identity: Identity, title: string): Promise<Conversation>;
  appendMessage(identity: Identity, conversationId: string, role: Message["role"], content: string): Promise<Message>;
  deleteConversation(identity: Identity, conversationId: string): Promise<boolean>;
  getUsage(identity: Identity, limit: number): Promise<UsageSnapshot>;
  consumeUsage(identity: Identity, increment: UsageIncrement, limit: number): Promise<UsageSnapshot | null>;
  addAudit(identity: Identity, action: string, targetId?: string): Promise<void>;
  listAudit(identity: Identity, limit?: number): Promise<AuditEvent[]>;
}
