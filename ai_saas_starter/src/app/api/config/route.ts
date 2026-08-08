import { aiProvider } from "@/lib/ai";
import { apiError } from "@/lib/api";
import { authenticateRequest } from "@/lib/auth/server";
import { workspaceStore } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await authenticateRequest(request);
    return Response.json({ storageMode: workspaceStore().mode, aiProvider: aiProvider().name }, {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    return apiError(error);
  }
}
