import { redirect } from "next/navigation";
import { auth, signIn } from "../../../auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth();
  if (session?.user) redirect("/workspace");

  return (
    <main className="main simple-page" style={{ margin: "0 auto", minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <section className="panel" style={{ width: "100%", maxWidth: 560 }}>
        <div className="eyebrow">FleetFlow access</div>
        <h1>Sign in to your workspace</h1>
        <p className="subtitle">FleetFlow uses your Authentik groups to choose the admin, driver, or customer workspace automatically.</p>
        <form action={async () => {
          "use server";
          await signIn("authentik", { redirectTo: "/workspace" });
        }}>
          <button className="workspace-option" type="submit">
            <span>
              <strong>Continue with Authentik</strong>
              <small>Your role and data permissions are checked after sign-in.</small>
            </span>
            <span className="option-arrow">?</span>
          </button>
        </form>
        <LoginError searchParams={searchParams} />
      </section>
    </main>
  );
}

async function LoginError({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  if (!error) return null;
  const message =
    error === "email"
      ? "Your account does not include an email address."
      : error === "Configuration" || error === "InvalidCheck"
        ? "Your sign-in request expired or was reopened. Start a new Authentik sign-in below."
        : "Your account could not access that workspace.";
  return <p style={{ color: "var(--red)", fontSize: 12, marginTop: 15 }}>{message}</p>;
}
