import type { Message } from "@/lib/domain";

export interface CompletionRequest {
  messages: Pick<Message, "role" | "content">[];
  signal?: AbortSignal;
}

export interface AiProvider {
  readonly name: string;
  stream(request: CompletionRequest): AsyncIterable<string>;
}
