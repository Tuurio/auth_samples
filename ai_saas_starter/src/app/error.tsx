"use client";

export default function ErrorPage({ reset }: { reset(): void }) {
  return <main className="centered-state"><div className="empty-card"><span className="eyebrow">Recoverable error</span><h1>The workspace paused safely.</h1><p>No credentials were exposed. Retry the failed view or return home.</p><button className="button" onClick={reset}>Try again</button></div></main>;
}
