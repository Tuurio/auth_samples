import { z } from "zod";

const positiveInteger = (fallback: number) => z.coerce.number().int().positive().catch(fallback);

const schema = z.object({
  AI_PROVIDER: z.enum(["demo", "openai-compatible"]).catch("demo"),
  AI_BASE_URL: z.string().url().catch("https://api.openai.com/v1"),
  AI_MODEL: z.string().min(1).catch("replace-with-your-model"),
  AI_API_KEY: z.string().optional(),
  AI_MONTHLY_TOKEN_LIMIT: positiveInteger(50_000),
  AI_REQUESTS_PER_MINUTE: positiveInteger(20),
});

export function serverEnv() {
  const value = schema.parse(process.env);
  if (value.AI_PROVIDER === "openai-compatible" && !value.AI_API_KEY) {
    throw new Error("AI_API_KEY is required when AI_PROVIDER=openai-compatible");
  }
  return value;
}
