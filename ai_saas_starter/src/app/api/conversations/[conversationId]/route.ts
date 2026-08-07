import { apiError } from "@/lib/api";
import { authenticateRequest } from "@/lib/auth/server";
import { workspaceStore } from "@/lib/storage";

interface Context { params: Promise<{ conversationId: string }> }

export async function GET(request: Request, context: Context) {
  try {
    const identity = await authenticateRequest(request);
    const { conversationId } = await context.params;
    const conversation = await workspaceStore().getConversation(identity, conversationId);
    if (!conversation) return Response.json({ error: "Conversation not found" }, { status: 404 });
    return Response.json({ conversation });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const identity = await authenticateRequest(request);
    const { conversationId } = await context.params;
    const deleted = await workspaceStore().deleteConversation(identity, conversationId);
    return deleted ? new Response(null, { status: 204 }) : Response.json({ error: "Conversation not found" }, { status: 404 });
  } catch (error) {
    return apiError(error);
  }
}
