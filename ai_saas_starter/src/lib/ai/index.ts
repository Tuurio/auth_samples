import type { AiProvider } from "@/lib/ai/types";
import { DemoAiProvider } from "@/lib/ai/demo";
import { OpenAiCompatibleProvider } from "@/lib/ai/openai-compatible";
import { serverEnv } from "@/lib/env";

let provider: AiProvider | null = null;

export function aiProvider(): AiProvider {
  if (!provider) {
    const env = serverEnv();
    provider = env.AI_PROVIDER === "openai-compatible"
      ? new OpenAiCompatibleProvider(env.AI_BASE_URL, env.AI_API_KEY!, env.AI_MODEL)
      : new DemoAiProvider();
  }
  return provider;
}
