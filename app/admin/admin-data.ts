export const metrics = [
  ["Today's jobs", "5", "+2 new"],
  ["Pending quotes", "3", "$1,120"],
  ["Waiting parts", "2", ""],
  ["In progress", "4", ""],
  ["Completed today", "6", "+18%"],
  ["Revenue this month", "$2,450", "+12%"],
];

export type JobHistoryEntry = {
  id: string;
  at: string;
  type: string;
  note: string;
  author?: string;
  status?: string;
};

export type Job = {
  reference: string;
  customer: string;
  email?: string;
  phone?: string;
  customerId?: string;
  device: string;
  issue: string;
  status: string;
  tone: "blue" | "amber" | "green" | "gray";
  priority: string;
  serviceType: string;
  owner: string;
  dueAt: string;
  updatedAt: string;
  completedAt?: string;
  archivedAt?: string;
  resolutionSummary?: string;
  billingStatus?: "Draft invoice" | "Invoice sent" | "Paid" | "No charge" | "Already paid";
  invoiceReference?: string;
  history?: JobHistoryEntry[];
};

export const jobs: Job[] = [
  { reference: "IT-0041", customer: "Sarah Mitchell", device: "Dell Latitude 5420", issue: "Windows not booting", status: "In progress", tone: "blue", priority: "High", serviceType: "Workshop repair", owner: "Omar", dueAt: "Today", updatedAt: "8 minutes ago" },
  { reference: "IT-0040", customer: "Bright Dental", device: "Office network", issue: "Intermittent Wi-Fi", status: "Waiting parts", tone: "amber", priority: "High", serviceType: "Business onsite", owner: "Omar", dueAt: "Tomorrow", updatedAt: "42 minutes ago" },
  { reference: "IT-0039", customer: "James Wu", device: "Custom PC", issue: "SSD upgrade & migration", status: "Ready", tone: "green", priority: "Normal", serviceType: "Workshop repair", owner: "Omar", dueAt: "Today", updatedAt: "1 hour ago" },
  { reference: "IT-0038", customer: "Northside Studio", device: "Microsoft 365", issue: "Mailbox migration", status: "Quote sent", tone: "gray", priority: "Normal", serviceType: "Remote support", owner: "Omar", dueAt: "Friday", updatedAt: "Yesterday" },
  { reference: "IT-0037", customer: "Anne Parker", device: "HP Pavilion", issue: "Slow performance", status: "Completed", tone: "green", priority: "Low", serviceType: "Workshop repair", owner: "Omar", dueAt: "Done", updatedAt: "2 hours ago" },
  { reference: "IT-0036", customer: "Bright Dental", device: "Reception PC", issue: "Outlook profile errors", status: "New", tone: "gray", priority: "High", serviceType: "Remote support", owner: "Unassigned", dueAt: "Today", updatedAt: "Today" },
];

export type Customer = {
  id: string;
  name: string;
  type: "Home" | "Business" | "Prospect";
  email: string;
  phone: string;
  devices: string;
  status: string;
  priority: "Low" | "Normal" | "High";
  lastActivity: string;
  notes: string;
};

export const customers: Customer[] = [
  { id: "CUST-1001", name: "Sarah Mitchell", type: "Home", email: "sarah@example.com", phone: "0400 111 222", devices: "2 devices", status: "Open job IT-0041", priority: "High", lastActivity: "8 minutes ago", notes: "Dell Latitude and home printer support." },
  { id: "CUST-1002", name: "Bright Dental", type: "Business", email: "admin@brightdental.example", phone: "03 9000 1000", devices: "Network + 9 workstations", status: "Quote Q-0026", priority: "High", lastActivity: "42 minutes ago", notes: "Clinic network, Microsoft 365, and reception workstation support." },
  { id: "CUST-1003", name: "James Wu", type: "Home", email: "james@example.com", phone: "0412 222 333", devices: "Custom PC", status: "Ready for pickup", priority: "Normal", lastActivity: "1 hour ago", notes: "Gaming PC upgrades and storage migration." },
  { id: "CUST-1004", name: "Northside Studio", type: "Business", email: "hello@northsidestudio.example", phone: "03 9000 2000", devices: "Microsoft 365", status: "Mailbox migration", priority: "Normal", lastActivity: "Yesterday", notes: "Creative studio using Microsoft 365 and shared file storage." },
  { id: "CUST-1005", name: "Anne Parker", type: "Home", email: "anne@example.com", phone: "0499 333 444", devices: "HP Pavilion", status: "Completed", priority: "Low", lastActivity: "2 hours ago", notes: "Laptop performance and SSD replacement." },
];

export const quotes = [
  {
    reference: "Q-0026",
    customer: "Bright Dental",
    relatedJob: "IT-0040",
    title: "Network remediation",
    status: "Sent",
    tone: "amber",
    subtotal: 1018.18,
    gst: 101.82,
    total: 1120,
    expiresAt: "20 Aug 2026",
    updatedAt: "42 minutes ago",
    items: [
      { description: "Network diagnosis and remediation labour", quantity: 4, unitPrice: 145 },
      { description: "Replacement access point allowance", quantity: 1, unitPrice: 540 },
    ],
  },
  {
    reference: "Q-0025",
    customer: "Northside Studio",
    relatedJob: "IT-0038",
    title: "Microsoft 365 migration",
    status: "Draft",
    tone: "gray",
    subtotal: 709.09,
    gst: 70.91,
    total: 780,
    expiresAt: "Not sent",
    updatedAt: "Yesterday",
    items: [
      { description: "Mailbox migration and DNS configuration", quantity: 3, unitPrice: 180 },
      { description: "Post-migration support block", quantity: 1, unitPrice: 240 },
    ],
  },
  {
    reference: "Q-0024",
    customer: "Anne Parker",
    relatedJob: "IT-0037",
    title: "SSD replacement",
    status: "Accepted",
    tone: "green",
    subtotal: 281.82,
    gst: 28.18,
    total: 310,
    expiresAt: "Accepted",
    updatedAt: "Last week",
    items: [
      { description: "500GB SSD and installation", quantity: 1, unitPrice: 180 },
      { description: "Data migration labour", quantity: 1, unitPrice: 130 },
    ],
  },
];

export type Quote = (typeof quotes)[number];

export type Invoice = {
  reference: string;
  customer: string;
  relatedJob: string;
  status: "Draft" | "Sent" | "Paid" | "No charge";
  tone: "blue" | "amber" | "green" | "gray";
  subtotal: number;
  gst: number;
  total: number;
  issuedAt: string;
  dueAt: string;
  updatedAt: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  notes: string;
};

export const invoices: Invoice[] = [];

export type InventoryItem = {
  sku: string;
  name: string;
  category: string;
  description?: string;
  specs?: string;
  warranty?: string;
  quantity: number;
  reorderLevel: number;
  salePrice: number;
  condition: "New" | "Tested" | "Refurbished" | "Used";
  type: "Parts" | "Equipment";
  publicVisible: boolean;
  imageUrl?: string;
  galleryUrls?: string[];
  updatedAt: string;
};

export const inventory: InventoryItem[] = [
  { sku: "SSD-1TB-SATA", name: "1TB SATA SSD", category: "Storage", quantity: 8, reorderLevel: 3, salePrice: 89, condition: "New", type: "Parts", publicVisible: false, updatedAt: "Today" },
  { sku: "SSD-2TB-NVME", name: "2TB NVMe SSD", category: "Storage", quantity: 2, reorderLevel: 2, salePrice: 189, condition: "New", type: "Parts", publicVisible: false, updatedAt: "Yesterday" },
  { sku: "RAM-DDR4-16", name: "16GB DDR4 SODIMM", category: "Memory", quantity: 12, reorderLevel: 4, salePrice: 62, condition: "New", type: "Parts", publicVisible: false, updatedAt: "Today" },
  { sku: "RAM-DDR5-32", name: "32GB DDR5 desktop kit", category: "Memory", quantity: 1, reorderLevel: 2, salePrice: 149, condition: "New", type: "Parts", publicVisible: false, updatedAt: "3 days ago" },
  { sku: "USB-C-DOCK", name: "USB-C business dock", category: "Docking", quantity: 4, reorderLevel: 2, salePrice: 129, condition: "Tested", type: "Equipment", publicVisible: true, imageUrl: "/equipment/usb-c-dock.webp", updatedAt: "Today" },
  { sku: "LAP-LAT5420", name: "Dell Latitude 5420 refurbished", category: "Laptop", quantity: 2, reorderLevel: 1, salePrice: 449, condition: "Refurbished", type: "Equipment", publicVisible: true, imageUrl: "/equipment/latitude-laptop.webp", updatedAt: "Today" },
  { sku: "DESK-HP-800G5", name: "HP EliteDesk 800 G5", category: "Desktop", quantity: 3, reorderLevel: 1, salePrice: 399, condition: "Refurbished", type: "Equipment", publicVisible: true, imageUrl: "/equipment/mini-desktop.webp", updatedAt: "Last week" },
  { sku: "AP-UNIFI-U6", name: "UniFi U6 access point", category: "Networking", quantity: 1, reorderLevel: 2, salePrice: 169, condition: "Tested", type: "Equipment", publicVisible: false, updatedAt: "Yesterday" },
  { sku: "CAB-CAT6-3M", name: "3m CAT6 patch cable", category: "Cabling", quantity: 36, reorderLevel: 10, salePrice: 7, condition: "New", type: "Parts", publicVisible: false, updatedAt: "Today" },
  { sku: "PSU-LAP-DELL65", name: "Dell 65W USB-C charger", category: "Power", quantity: 6, reorderLevel: 3, salePrice: 39, condition: "Tested", type: "Parts", publicVisible: false, updatedAt: "4 days ago" },
];

export const activities = [
  ["Job IT-0041 moved to In progress", "8 minutes ago - Omar"],
  ["Quote Q-0026 sent to Bright Dental", "42 minutes ago"],
  ["New support request received", "1 hour ago - Website"],
  ["Job IT-0037 marked completed", "2 hours ago - Omar"],
];

export type Followup = {
  id: string;
  customer: string;
  reason: string;
  related: string;
  dueAt: string;
  dueDateTime?: string;
  owner: string;
  status: "Planned" | "Scheduled" | "Due" | "Waiting" | "Overdue" | "Completed";
  tone: "blue" | "amber" | "green" | "gray";
  channel: "WhatsApp" | "Email" | "Phone";
  priority?: "Low" | "Normal" | "High";
  outcome?: string;
  lastAction?: string;
  completedAt?: string;
};

export const followups: Followup[] = [
  { id: "FU-1004", customer: "Tameem Manaa", reason: "Confirm laptop model and backup requirement", related: "REQ-055547", dueAt: "Today", owner: "Omar", status: "Due", tone: "amber", channel: "WhatsApp" },
  { id: "FU-1003", customer: "Bright Dental", reason: "Confirm network quote approval", related: "Q-0026", dueAt: "Tomorrow", owner: "Omar", status: "Scheduled", tone: "blue", channel: "Email" },
  { id: "FU-1002", customer: "James Wu", reason: "Pickup reminder for completed SSD migration", related: "IT-0039", dueAt: "Today", owner: "Omar", status: "Due", tone: "amber", channel: "WhatsApp" },
  { id: "FU-1001", customer: "Anne Parker", reason: "Post-repair check-in", related: "IT-0037", dueAt: "Next week", owner: "Omar", status: "Planned", tone: "gray", channel: "Email" },
  { id: "FU-1000", customer: "Northside Studio", reason: "Mailbox migration feedback", related: "IT-0038", dueAt: "Done", owner: "Omar", status: "Completed", tone: "green", channel: "Email" },
];

export const adminSections = {
  jobs: {
    title: "Jobs & Repairs",
    subtitle: "Repair tickets, field work, remote support, and service status",
    action: "+ New job",
    actionHref: "/admin/jobs/new",
  },
  requests: {
    title: "Support Requests",
    subtitle: "Website intake, customer questions, and response templates",
    action: "+ Request",
    actionHref: "/#support-assistant",
  },
  customers: {
    title: "Customers",
    subtitle: "Customer profiles, linked devices, jobs, quotes, and follow-ups",
    action: "+ Customer",
    actionHref: "/admin/customers/new",
  },
  quotes: {
    title: "Quotes",
    subtitle: "Draft, send, approve, and convert quoted work",
    action: "+ Quote",
    actionHref: "/admin/quotes/new",
  },
  invoices: {
    title: "Invoices",
    subtitle: "Billable work, paid jobs, no-charge records, and customer receipts",
    action: "+ Invoice",
    actionHref: "/admin/invoices/new",
  },
  inventory: {
    title: "Inventory",
    subtitle: "Parts, stock levels, sale pricing, and reorder visibility",
    action: "+ Inventory",
    actionHref: "/admin/inventory/new",
  },
  equipment: {
    title: "Equipment Sales",
    subtitle: "Refurbished devices and tested equipment ready for sale",
    action: "+ Equipment",
    actionHref: "/admin/equipment/new",
  },
  followups: {
    title: "Follow-ups",
    subtitle: "Callbacks, reminders, warranty checks, and customer care",
    action: "+ Follow-up",
    actionHref: "/admin/followups/new",
  },
  reports: {
    title: "Reports",
    subtitle: "Revenue, workload, completed work, and operational trends",
    action: "Export",
    actionHref: "/admin/reports/export",
  },
} as const;

export type AdminSection = keyof typeof adminSections;
