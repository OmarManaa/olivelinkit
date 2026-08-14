import Link from "next/link";

export default function NotAuthorized() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f4f6fa", padding: 24 }}>
      <section style={{ maxWidth: 520, background: "white", padding: 36, border: "1px solid #e2e7ef", borderRadius: 8, textAlign: "center" }}>
        <h1 style={{ fontSize: 24 }}>Administrator access only</h1>
        <p style={{ color: "#64748b", lineHeight: 1.6 }}>
          This area is protected. Sign in with the admin username and password, or contact the site owner to grant access.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
          <Link className="button" href="/admin/login">
            Open admin login
          </Link>
          <Link className="button" href="/">
            Return to website
          </Link>
        </div>
      </section>
    </main>
  );
}
