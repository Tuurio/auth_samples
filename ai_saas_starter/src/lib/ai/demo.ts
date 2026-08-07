import type { AiProvider, CompletionRequest } from "@/lib/ai/types";

export class DemoAiProvider implements AiProvider {
  readonly name = "local-demo";

  async *stream(request: CompletionRequest): AsyncIterable<string> {
    const last = request.messages.at(-1)?.content ?? "your idea";
    const topic = last.replace(/\s+/g, " ").trim().slice(0, 80);
    const chunks = [
      "Demo mode is active — no prompt was sent to an external AI provider.\n\n",
      `Here is a practical way to approach “${topic || "your idea"}”:\n\n`,
      "1. Define the smallest user outcome.\n",
      "2. Keep identity and organization boundaries server-enforced.\n",
      "3. Measure one useful activation event before adding more surface area.\n\n",
      "Configure an OpenAI-compatible provider in the server environment when you are ready for model-generated responses.",
    ];
    for (const chunk of chunks) {
      if (request.signal?.aborted) return;
      await new Promise((resolve) => setTimeout(resolve, 12));
      yield chunk;
    }
  }
}
