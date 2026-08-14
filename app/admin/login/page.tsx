"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "../../brand-logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("omarmanaa");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.ok) {
        setError(payload.error || "Incorrect username or password.");
        setIsSubmitting(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Unable to sign in right now. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(180deg, #f3f7fb 0%, #edf2f7 100%)", padding: 24 }}>
      <section style={{ width: "100%", maxWidth: 440, background: "rgba(255,255,255,0.88)", border: "1px solid #dfeaf3", borderRadius: 16, padding: 28, boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)", backdropFilter: "blur(8px)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 18 }}>
          <BrandLogo className="logo-mark" />
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#0f172a", letterSpacing: 0.2 }}>OliveLink IT Solutions</div>
            <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1.2, textTransform: "uppercase" }}>Business Console</div>
          </div>
        </div>

        <h1 style={{ margin: "0 0 10px", textAlign: "center", fontSize: 30, color: "#0f172a" }}>Admin access</h1>
        <p style={{ margin: "0 0 24px", textAlign: "center", color: "#475569", lineHeight: 1.5 }}>
          Sign in to manage jobs, quotes, support requests, inventory, and website content.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>Username</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} style={{ padding: "12px 14px", border: "1px solid #cbd5e1", borderRadius: 10, fontSize: 15, background: "#fff" }} autoComplete="username" />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} style={{ padding: "12px 14px", border: "1px solid #cbd5e1", borderRadius: 10, fontSize: 15, background: "#fff" }} autoComplete="current-password" />
          </label>

          {error ? (
            <div style={{ color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 12px" }}>{error}</div>
          ) : null}

          <button type="submit" disabled={isSubmitting} style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", color: "white", border: "none", borderRadius: 10, padding: "13px 18px", fontWeight: 800, cursor: isSubmitting ? "default" : "pointer", opacity: isSubmitting ? 0.72 : 1, boxShadow: "0 12px 24px rgba(37, 99, 235, 0.2)" }}>
            {isSubmitting ? "Signing in..." : "Sign in to admin"}
          </button>
        </form>
      </section>
    </main>
  );
}
