import { HeroActions } from "@/components/hero-actions";
import { SiteHeader } from "@/components/site-header";

export default function PricingPage() {
  return <main><SiteHeader /><section className="pricing-hero"><span className="eyebrow">Simple starter boundaries</span><h1>Start in demo mode.<br /><em>Scale deliberately.</em></h1><p>Authentication, AI usage, and billing stay separate so you can choose the right provider for each responsibility.</p></section><section className="plans">
    <article><span>Local</span><h2>Demo</h2><strong>€0</strong><p>Memory storage and deterministic local responses. Real Tuurio authentication is still required for protected data.</p><ul><li>Reset-on-restart storage</li><li>No external AI calls</li><li>Full product UI</li></ul></article>
    <article className="featured"><span>Deploy</span><h2>Production foundation</h2><strong>Your infrastructure</strong><p>Bring Postgres and an OpenAI-compatible provider while Tuurio secures user and organization identity.</p><ul><li>Tenant-scoped persistence</li><li>Usage and request limits</li><li>Audit and administration</li></ul><HeroActions /></article>
  </section></main>;
}
