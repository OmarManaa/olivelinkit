import { ServicePricingEditor } from "../../service-pricing-editor";

export const dynamic = "force-dynamic";

export default function ServicePricingPage() {
  return (
    <>
      <header className="admin-topbar">
        <div>
          <h1>Service Pricing</h1>
          <small>Edit repair prices, ranges, public visibility, and quote guidance</small>
        </div>
      </header>
      <div className="admin-content"><ServicePricingEditor /></div>
    </>
  );
}
