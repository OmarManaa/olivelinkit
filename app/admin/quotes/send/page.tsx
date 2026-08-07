import Link from "next/link";
import { customers, quotes } from "../../admin-data";
import { QuoteSendPanel } from "../../quote-send-panel";

export const dynamic = "force-dynamic";

export default function SendQuotePage() {
  return (
    <>
      <header className="admin-topbar">
        <div>
          <h1>Send Quote</h1>
          <small>Preview customer message, open email or WhatsApp, and mark the quote sent</small>
        </div>
        <Link className="admin-action secondary" href="/admin/quotes">Back to quotes</Link>
      </header>
      <div className="admin-content">
        <QuoteSendPanel quotes={quotes} customers={customers} />
      </div>
    </>
  );
}
