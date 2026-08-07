import { z } from "zod";
import { aiProvider } from "@/lib/ai";
import { apiError } from "@/lib/api";
import { authenticateRequest } from "@/lib/auth/server";
import { serverEnv } from "@/lib/env";
import { SlidingWindowLimiter } from "@/lib/rate-limit";
import { workspaceStore } from "@/lib/storage";
import { estimateUnits } from "@/lib/storage/shared";

const inputSchema = z.object({ content: z.string().trim().min(1).max(8_000) });
const env = serverEnv();
const limiter = new SlidingWindowLimiter(env.AI_REQUESTS_PER_MINUTE);
const RESERVED_OUTPUT_UNITS = 512;

interface Context { params: Promise<{ conversationId: string }> }

export async function POST(request: Request, context: Context) {
  try {
    const identity = await authenticateRequest(request);
    const rate = limiter.take(`${identity.tenantId}:${identity.subject}`);
    if (!rate.allowed) {
      return Response.json({ error: "Too many AI requests. Try again shortly." }, {
        status: 429,
        headers: { "retry-after": String(rate.retryAfterSeconds) },
      });
    }
    const input = inputSchema.parse(await request.json());
    const { conversationId } = await context.params;
    const store = workspaceStore();
    if (!await store.getConversation(identity, conversationId)) {
      return Response.json({ error: "Conversation not found" }, { status: 404 });
    }
    const usage = await store.consumeUsage(identity, {
      inputUnits: estimateUnits(input.content),
      outputUnits: RESERVED_OUTPUT_UNITS,
    }, env.AI_MONTHLY_TOKEN_LIMIT);
    if (!usage) return Response.json({ error: "This workspace reached its monthly AI quota" }, { status: 402 });

    await store.appendMessage(identity, conversationId, "user", input.content);
    const conversation = await store.getConversation(identity, conversationId);
    await store.addAudit(identity, "ai.requested", conversationId);
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let complete = "";
        try {
          for await (const chunk of aiProvider().stream({
            messages: (conversation?.messages ?? []).map(({ role, content }) => ({ role, content })),
            signal: request.signal,
          })) {
            complete += chunk;
            controller.enqueue(encoder.encode(chunk));
          }
          if (complete.trim()) await store.appendMessage(identity, conversationId, "assistant", complete);
          await store.addAudit(identity, "ai.completed", conversationId);
          controller.close();
        } catch {
          await store.addAudit(identity, "ai.failed", conversationId);
          controller.error(new Error("AI provider stream failed"));
        }
      },
      cancel() { /* The provider observes request.signal directly. */ },
    });
    return new Response(stream, {
      headers: {
        "cache-control": "no-store",
        "content-type": "text/plain; charset=utf-8",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "A message between 1 and 8,000 characters is required" }, { status: 400 });
    return apiError(error);
  }
}
