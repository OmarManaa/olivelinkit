"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "../../brand-logo";

export default function AdminSettingsPage() {
  const [currentUsername, setCurrentUsername] = useState("omarmanaa");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("omarmanaa");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentUsername, currentPassword, newUsername, newPassword, confirmPassword }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.ok) {
        setError(payload.error || "Unable to update the admin login.");
        setIsSubmitting(false);
        return;
      }

      setSuccess("Admin credentials updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsSubmitting(false);
    } catch {
      setError("Unable to update credentials right now. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <header className="admin-topbar" style={{ marginBottom: 24 }}>
        <div>
          <h1>Account settings</h1>
          <small>Update the admin sign-in credentials for this console.</small>
        </div>
        <div className="dashboard-topbar-actions">
          <Link className="admin-action secondary" href="/admin">Back to dashboard</Link>
        </div>
      </header>

      <section style={{ maxWidth: 620, background: "#fff", border: "1px solid #dfeaf3", borderRadius: 16, padding: 24, boxShadow: "0 18px 40px rgba(15, 23, 42, 0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <BrandLogo className="logo-mark" />
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#0f172a" }}>OliveLink IT Solutions</div>
            <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1.2, textTransform: "uppercase" }}>Secure admin profile</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ fontWeight: 700, color: "#0f172a" }}>Current username</label>
            <input value={currentUsername} onChange={(event) => setCurrentUsername(event.target.value)} style={{ padding: "11px 12px", border: "1px solid #cbd5e1", borderRadius: 10 }} autoComplete="username" />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ fontWeight: 700, color: "#0f172a" }}>Current password</label>
            <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} style={{ padding: "11px 12px", border: "1px solid #cbd5e1", borderRadius: 10 }} autoComplete="current-password" />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ fontWeight: 700, color: "#0f172a" }}>New username</label>
            <input value={newUsername} onChange={(event) => setNewUsername(event.target.value)} style={{ padding: "11px 12px", border: "1px solid #cbd5e1", borderRadius: 10 }} autoComplete="username" />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ fontWeight: 700, color: "#0f172a" }}>New password</label>
            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} style={{ padding: "11px 12px", border: "1px solid #cbd5e1", borderRadius: 10 }} autoComplete="new-password" />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ fontWeight: 700, color: "#0f172a" }}>Confirm new password</label>
            <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} style={{ padding: "11px 12px", border: "1px solid #cbd5e1", borderRadius: 10 }} autoComplete="new-password" />
          </div>

          {error ? (
            <div style={{ color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 12px" }}>{error}</div>
          ) : null}

          {success ? (
            <div style={{ color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 12px" }}>{success}</div>
          ) : null}

          <button type="submit" disabled={isSubmitting} style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#fff", border: "0", borderRadius: 10, padding: "12px 18px", fontWeight: 800, cursor: isSubmitting ? "default" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? "Updating..." : "Update admin password"}
          </button>
        </form>
      </section>
    </div>
  );
}
