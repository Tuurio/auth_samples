import { aiProvider } from "@/lib/ai";
import { workspaceStore } from "@/lib/storage";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ storageMode: workspaceStore().mode, aiProvider: aiProvider().name }, {
    headers: { "cache-control": "no-store" },
  });
}
