export type SupportRequest = {
  id: string;
  issueType: string;
  name: string;
  email?: string;
  phone?: string;
  details: string;
  businessContext?: string;
  selectedService?: string;
  selectedItem?: {
    sku: string;
    name: string;
    category?: string;
    condition?: string;
    salePrice?: number;
    quantity?: number;
    imageUrl?: string;
  };
  status: "New" | "Replied" | "Follow-up" | "Converted" | "Closed";
  createdAt: string;
  lastAction?: string;
};

const STORAGE_KEY = "it-services-support-requests";

export function readSupportRequests(): SupportRequest[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedRequests();

  try {
    const parsed = JSON.parse(raw) as SupportRequest[];
    return Array.isArray(parsed) ? parsed : seedRequests();
  } catch {
    return seedRequests();
  }
}

export async function submitSupportRequest(input: Pick<SupportRequest, "issueType" | "name" | "details"> & Partial<Pick<SupportRequest, "email" | "phone" | "businessContext" | "selectedService" | "selectedItem">> & { company?: string }) {
  const response = await fetch("/api/support-requests", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await response.json() as { request?: SupportRequest; error?: string };
  if (!response.ok || !payload.request) throw new Error(payload.error || "Your request could not be sent.");

  writeSupportRequests([payload.request, ...readSupportRequests().filter((request) => request.id !== payload.request?.id)]);
  return payload.request;
}

export async function updateSupportRequestStatus(id: string, status: SupportRequest["status"]) {
  const previous = readSupportRequests();
  const lastAction = new Date().toISOString();
  const requests = previous.map((request) => request.id === id ? { ...request, status, lastAction } : request);
  writeSupportRequests(requests);
  const response = await fetch("/api/support-requests", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
  const payload = await response.json().catch(() => ({})) as { request?: SupportRequest; error?: string };
  if (!response.ok || !payload.request) {
    writeSupportRequests(previous);
    throw new Error(payload.error || "The support request could not be updated.");
  }
  writeSupportRequests(previous.map((request) => request.id === id ? payload.request! : request));
  return payload.request;
}

export function replaceSupportRequests(requests: SupportRequest[]) {
  if (typeof window === "undefined") return;
  writeSupportRequests(requests);
}

function writeSupportRequests(requests: SupportRequest[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  window.dispatchEvent(new Event("support-requests-updated"));
}

function seedRequests() {
  const seeded: SupportRequest[] = [
    {
      id: "REQ-1001",
      issueType: "Business IT",
      name: "Bright Dental",
      email: "admin@brightdental.example",
      phone: "03 9000 1000",
      details: "Need help reviewing Wi-Fi dropouts and Microsoft 365 email reliability for the clinic.",
      status: "New",
      createdAt: "Today, 9:15 AM",
    },
    {
      id: "REQ-1000",
      issueType: "Quote request",
      name: "Northside Studio",
      email: "hello@northsidestudio.example",
      details: "Looking for a quote to migrate three mailboxes and improve backup for shared files.",
      status: "Replied",
      createdAt: "Yesterday, 4:30 PM",
    },
  ];
  writeSupportRequests(seeded);
  return seeded;
}
