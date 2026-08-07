import { apiError } from "@/lib/api";
import { authenticateRequest } from "@/lib/auth/server";
import { workspaceStore } from "@/lib/storage";

export async function GET(request: Request) {
  try {
    const identity = await authenticateRequest(request);
    if (identity.role !== "admin") return Response.json({ error: "Administrator access is required" }, { status: 403 });
    return Response.json({
      actor: { email: identity.email, name: identity.name, role: identity.role },
      audit: await workspaceStore().listAudit(identity),
      membershipManagementUrl: `${identity.tenantId}/admin`,
    });
  } catch (error) {
    return apiError(error);
  }
}
