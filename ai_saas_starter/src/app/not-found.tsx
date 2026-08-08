import Link from "next/link";

export default function NotFound() {
  return <main className="centered-state"><div className="empty-card"><span className="eyebrow">404 · Not found</span><h1>This path is outside the workspace.</h1><p>Return to the product home or open your authenticated workspace.</p><div className="hero-actions"><Link className="button" href="/">Product home</Link><Link className="button secondary" href="/workspace">Workspace</Link></div></div></main>;
}
