import Link from "next/link";
import { SupersetNetworkMap } from "@/components/superset-network-map";
import { HeroVideoSlider } from "@/components/hero-video-slider";
import { activeBranches } from "@/lib/branches";

export default function HomePage() {
  return (
    <main className="landing-page">
      <header className="landing-nav"><Link className="landing-brand" href="/"><span className="brand-mark">FF</span><span>FleetFlow</span></Link><nav><a href="#platform">Platform</a><a href="#network">Network</a><a href="#roles">Workspaces</a></nav><div className="page-actions"><Link className="button secondary" href="/login">Sign in</Link><Link className="button" href="/login">Get started</Link></div></header>
      <HeroVideoSlider />
      <section className="landing-intro" id="platform"><div><span className="eyebrow">The operating layer for delivery</span><h2>Clarity at every mile.</h2></div><p>FleetFlow brings the people, shipments, and decisions behind regional delivery into one dependable view.</p></section>
      <section className="landing-feature-grid" id="roles">
        <article className="landing-feature-card"><div className="feature-image"><img src="/adminstration guy.jpg" alt="FleetFlow administrator reviewing operations" /></div><div className="feature-copy"><span className="feature-number">01</span><h3>For operations teams</h3><p>See the whole network, assign work, and resolve exceptions before they become customer problems.</p><Link href="/admin">Explore admin operations <span>→</span></Link></div></article>
        <article className="landing-feature-card reverse"><div className="feature-image"><img src="/guy imges .jpg" alt="FleetFlow driver preparing a delivery" /></div><div className="feature-copy"><span className="feature-number">02</span><h3>For drivers in motion</h3><p>Keep every route focused with clear assignments, fast status updates, and simple delivery notes.</p><Link href="/driver">Open driver workspace <span>→</span></Link></div></article>
      </section>
      <section className="landing-stat-strip"><div><strong>99.2%</strong><span>on-time handoffs</span></div><div><strong>24/7</strong><span>operational visibility</span></div><div><strong>6</strong><span>active branches</span></div><div><strong>1 source</strong><span>of shipment truth</span></div></section>
      <section className="panel network-panel landing-network" id="network"><div className="panel-heading"><div><span className="eyebrow">Connected by design</span><h2>Our operating network</h2><p className="subtitle">Active FleetFlow branches coordinate cross-border and regional delivery flows.</p></div><span className="status-badge status-delivered">Network online</span></div><SupersetNetworkMap /><div className="branch-grid">{activeBranches.map((branch) => <div className="branch-card" key={branch.code}><span className="branch-code">{branch.code}</span><div><strong>{branch.name}</strong><small>{branch.city}, {branch.country} · {branch.volume}</small></div></div>)}</div></section>
      <footer className="landing-footer"><div className="landing-brand"><span className="brand-mark">FF</span><span>FleetFlow</span></div><span>Regional delivery, made visible.</span><Link href="/track">Track a shipment →</Link></footer>
    </main>
  );
}
