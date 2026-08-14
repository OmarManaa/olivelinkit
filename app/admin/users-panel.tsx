"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

type Admin = { email: string; name?: string | null; role?: string | null; active?: boolean | number | null };

function isAdminActive(item: Admin) {
  return item.active === true || item.active === 1;
}

export default function UsersPanel() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  async function refreshAdmins() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const payload = await res.json();
      setAdmins(payload.items ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    void fetch("/api/admin/users", { cache: "no-store" })
      .then((res) => res.json())
      .then((payload) => {
        if (!ignore) setAdmins(payload.items ?? []);
      })
      .catch(() => {
        // ignore
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function addAdmin(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    await fetch("/api/admin/users", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, name, role }) });
    setEmail("");
    setName("");
    setRole("");
    await refreshAdmins();
  }

  async function toggleActive(item: Admin) {
    await fetch("/api/admin/users", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: item.email, active: !isAdminActive(item) }) });
    await refreshAdmins();
  }

  async function removeAdmin(item: Admin) {
    await fetch(`/api/admin/users?email=${encodeURIComponent(item.email)}`, { method: "DELETE" });
    await refreshAdmins();
  }

  return (
    <div>
      <h2>Admin Users</h2>
      <form onSubmit={addAdmin} style={{ marginBottom: 12 }}>
        <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="role" value={role} onChange={(e) => setRole(e.target.value)} />
        <button type="submit">Add admin</button>
      </form>
      <div>
        {loading ? <div>Loading...</div> : (
          <table>
            <thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Active</th><th /></tr></thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.email}>
                  <td>{a.email}</td>
                  <td>{a.name}</td>
                  <td>{a.role}</td>
                  <td>{isAdminActive(a) ? "Yes" : "No"}</td>
                  <td>
                    <button onClick={() => void toggleActive(a)}>Toggle</button>
                    <button onClick={() => void removeAdmin(a)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
