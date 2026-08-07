import { BackupRestorePanel } from "../backup-restore-panel";

export const dynamic = "force-dynamic";

export default function BackupPage() {
  return (
    <>
      <header className="admin-topbar">
        <div>
          <h1>Backup & Restore</h1>
          <small>Export or restore local admin data while the site is running locally</small>
        </div>
      </header>
      <div className="admin-content"><BackupRestorePanel /></div>
    </>
  );
}
