"use client";

import { useRouter } from "next/navigation";
import { Shell } from "../components/Shell";
import { Card } from "../components/Card";

export default function NotFound() {
  const router = useRouter();
  return (
    <Shell status={{ label: "Route not found", tone: "neutral" }}>
      <Card>
        <div className="stack">
          <div className="status status-bad">404</div>
          <h2 className="card-title">This route doesn't exist.</h2>
          <p className="muted">Return to the login page to start a new session.</p>
          <button className="button ghost" onClick={() => router.replace("/")}>
            Go home
          </button>
        </div>
      </Card>
    </Shell>
  );
}
