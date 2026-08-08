import { z } from "zod";
import { apiError } from "@/lib/api";
import { authenticateRequest } from "@/lib/auth/server";
import { workspaceStore } from "@/lib/storage";

const createSchema = z.object({ title: z.string().trim().min(1).max(160) });

export async function GET(request: Request) {
  try {
    const identity = await authenticateRequest(request);
    return Response.json({ conversations: await workspaceStore().listConversations(identity) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const identity = await authenticateRequest(request);
    const input = createSchema.parse(await request.json());
    return Response.json({ conversation: await workspaceStore().createConversation(identity, input.title) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "A title between 1 and 160 characters is required" }, { status: 400 });
    return apiError(error);
  }
}
