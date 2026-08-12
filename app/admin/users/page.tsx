import UsersPanel from "../users-panel";
import { requireAdmin } from "../admin-auth";

export default async function Page() {
  await requireAdmin();
  return (
    <div style={{ padding: 20 }}>
      <h1>Admin users</h1>
      {/* @ts-ignore */}
      <UsersPanel />
    </div>
  );
}
