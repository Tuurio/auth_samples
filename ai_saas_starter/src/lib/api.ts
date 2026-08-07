import { AuthFailure } from "@/lib/auth/server";

export function apiError(error: unknown): Response {
  if (error instanceof AuthFailure) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof Error && error.message === "ADMIN_REQUIRED") {
    return Response.json({ error: "Administrator access is required" }, { status: 403 });
  }
  if (error instanceof Error && error.message === "CONVERSATION_NOT_FOUND") {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }
  return Response.json({ error: "The request could not be completed" }, { status: 500 });
}
