import { HeroActions } from "@/components/hero-actions";
import { SiteHeader } from "@/components/site-header";

const features = [
  ["Identity that respects the boundary", "Every API request validates the issuer, audience, signature, and expiry before touching tenant data."],
  ["A complete AI product slice", "Stream conversations, persist history, enforce quotas, and swap providers without moving credentials into the browser."],
  ["Operations already considered", "Role-aware administration, audit events, deletion, provider errors, empty states, and production migration guidance."],
];

export default function HomePage() {
  return <main>
    <SiteHeader />
    <section className="hero">
      <div className="eyebrow">Open-source AI SaaS foundation</div>
      <h1>Turn a useful idea into a<br /><em>trusted workspace.</em></h1>
      <p className="hero-copy">A deployable multi-tenant AI product with streaming, persistence, usage controls, and EU-hosted Tuurio identity built in.</p>
      <HeroActions />
      <div className="trust-row"><span>Authorization Code + PKCE</span><span>Server-validated tokens</span><span>Apache-2.0</span></div>
    </section>
    <section className="product-preview" id="product">
      <aside>
        <div className="mini-brand">Tuurio Canvas</div>
        <div className="mock-nav active">Product launch plan</div>
        <div className="mock-nav">Customer research</div>
        <div className="mock-nav">Security review</div>
      </aside>
      <div className="mock-chat">
        <span className="eyebrow">Workspace / Product</span>
        <h2>What should we ship first?</h2>
        <div className="bubble user">Turn our customer notes into a focused launch plan.</div>
        <div className="bubble assistant">Start with one measurable activation outcome. I would sequence the work into three small releases…</div>
        <div className="mock-composer">Ask a follow-up <span>↗</span></div>
      </div>
    </section>
    <section className="feature-grid">
      {features.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h2>{title}</h2><p>{body}</p></article>)}
    </section>
    <section className="closing"><div><span className="eyebrow">Your product, not an auth demo</span><h2>Build the differentiated part.</h2></div><HeroActions /></section>
    <footer><span>Tuurio Canvas</span><span>Identity hosted in the European Union · App infrastructure chosen by you</span></footer>
  </main>;
}
