"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completeSigninOnce } from "@/lib/auth/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    completeSigninOnce()
      .then((user) => {
        const state = user.state as { returnTo?: unknown } | undefined;
        const returnTo = typeof state?.returnTo === "string" && state.returnTo.startsWith("/") && !state.returnTo.startsWith("//")
          ? state.returnTo
          : "/workspace";
        router.replace(returnTo);
      })
      .catch(() => setError("The sign-in callback could not be validated. Start a new sign-in."));
  }, [router]);
  return <main className="centered-state"><p>{error ?? "Validating your secure sign-in…"}</p>{error && <a href="/">Return home</a>}</main>;
}
