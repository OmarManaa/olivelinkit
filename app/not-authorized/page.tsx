import Link from "next/link";

export default function NotAuthorized() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f4f6fa", padding: 24 }}>
      <section style={{ maxWidth: 520, background: "white", padding: 36, border: "1px solid #e2e7ef", borderRadius: 8, textAlign: "center" }}>
        <h1 style={{ fontSize: 24 }}>Administrator access only</h1>
        <p style={{ color: "#64748b", lineHeight: 1.6 }}>
          This area is protected. If you are approved by the Cloudflare Access policy, sign in and then return to the admin console.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
          <Link className="button" href="/admin">
            Open admin console
          </Link>
          <Link className="button" href="/">
            Return to website
          </Link>
        </div>
      </section>
    </main>
  );
}
