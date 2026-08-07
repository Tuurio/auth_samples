import { apiError } from "@/lib/api";
import { authenticateRequest } from "@/lib/auth/server";
import { serverEnv } from "@/lib/env";
import { workspaceStore } from "@/lib/storage";

export async function GET(request: Request) {
  try {
    const identity = await authenticateRequest(request);
    return Response.json({ usage: await workspaceStore().getUsage(identity, serverEnv().AI_MONTHLY_TOKEN_LIMIT) });
  } catch (error) {
    return apiError(error);
  }
}
