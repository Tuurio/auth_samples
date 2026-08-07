import type { WorkspaceStore } from "@/lib/domain";
import { MemoryWorkspaceStore } from "@/lib/storage/memory";
import { createPostgresStore } from "@/lib/storage/postgres";

const globalStore = globalThis as typeof globalThis & { __tuurioWorkspaceStore?: WorkspaceStore };

export function workspaceStore(): WorkspaceStore {
  if (!globalStore.__tuurioWorkspaceStore) {
    globalStore.__tuurioWorkspaceStore = process.env.DATABASE_URL
      ? createPostgresStore(process.env.DATABASE_URL)
      : new MemoryWorkspaceStore();
  }
  return globalStore.__tuurioWorkspaceStore;
}
