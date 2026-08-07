export type SupportRequest = {
  id: string;
  issueType: string;
  name: string;
  email?: string;
  phone?: string;
  details: string;
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

export function saveSupportRequest(input: Pick<SupportRequest, "issueType" | "name" | "details"> & Partial<Pick<SupportRequest, "email" | "phone">>) {
  const requests = readSupportRequests();
  const request: SupportRequest = {
    id: `REQ-${Date.now().toString().slice(-6)}`,
    issueType: input.issueType,
    name: input.name || "Website visitor",
    email: input.email?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    details: input.details || "No details provided yet.",
    status: "New",
    createdAt: new Date().toLocaleString(),
  };

  writeSupportRequests([request, ...requests]);
  return request;
}

export function updateSupportRequestStatus(id: string, status: SupportRequest["status"]) {
  const requests = readSupportRequests().map((request) => request.id === id ? { ...request, status, lastAction: new Date().toLocaleString() } : request);
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
