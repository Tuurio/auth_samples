import type { AiProvider, CompletionRequest } from "@/lib/ai/types";

export class OpenAiCompatibleProvider implements AiProvider {
  readonly name = "openai-compatible";
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async *stream(request: CompletionRequest): AsyncIterable<string> {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ model: this.model, messages: request.messages, stream: true }),
      signal: request.signal,
    });
    if (!response.ok || !response.body) throw new Error(`AI provider request failed with HTTP ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") return;
        try {
          const parsed = JSON.parse(data) as { choices?: { delta?: { content?: unknown } }[] };
          const content = parsed.choices?.[0]?.delta?.content;
          if (typeof content === "string") yield content;
        } catch {
          throw new Error("AI provider returned a malformed stream");
        }
      }
      if (done) return;
    }
  }
}
