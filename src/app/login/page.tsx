import { signIn } from "../../../auth";

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return <main className="main simple-page" style={{ margin: "0 auto", minHeight: "100vh", display: "grid", placeItems: "center" }}><section className="panel" style={{ width: "100%", maxWidth: 560 }}><div className="eyebrow">FleetFlow access</div><h1>Choose your workspace</h1><p className="subtitle">Select where you want to land after Authentik signs you in. Your actual permissions still come from your Authentik groups.</p><div className="login-options"><LoginOption label="Admin operations" description="Metrics, assignments, users, and exceptions." redirectTo="/admin" /><LoginOption label="Driver workspace" description="Assigned route, status updates, and delivery notes." redirectTo="/driver" /><LoginOption label="Customer tracking" description="Shipment lookup and verified delivery timeline." redirectTo="/track" /></div><LoginError searchParams={searchParams} /></section></main>;
}

function LoginOption({ label, description, redirectTo }: { label: string; description: string; redirectTo: string }) {
  return <form action={async () => { "use server"; await signIn("authentik", { redirectTo }); }}><button className="workspace-option"><span><strong>{label}</strong><small>{description}</small></span><span className="option-arrow">→</span></button></form>;
}

async function LoginError({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  if (!error) return null;
  return <p style={{ color: "var(--red)", fontSize: 12, marginTop: 15 }}>You do not have the required FleetFlow role for this area.</p>;
}
