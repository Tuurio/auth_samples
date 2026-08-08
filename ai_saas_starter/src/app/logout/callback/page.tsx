"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completeSignoutOnce } from "@/lib/auth/client";

export default function LogoutCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    completeSignoutOnce().then(() => router.replace("/")).catch(() => setError("Sign-out could not be completed. Clear this site's session storage and retry."));
  }, [router]);
  return <main className="centered-state"><p>{error ?? "Completing sign-out…"}</p>{error && <a href="/">Return home</a>}</main>;
}
