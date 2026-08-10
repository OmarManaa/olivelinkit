export type ServiceIconKey = "laptop" | "network" | "business" | "shield" | "remote" | "hardware";

export type WebsiteService = {
  id: string;
  title: string;
  requestType: string;
  text: string;
  icon: ServiceIconKey;
};

export const serviceIconOptions: { key: ServiceIconKey; label: string }[] = [
  { key: "laptop", label: "Laptop repair" },
  { key: "network", label: "Network" },
  { key: "business", label: "Business IT" },
  { key: "shield", label: "Security" },
  { key: "remote", label: "Remote support" },
  { key: "hardware", label: "Hardware" },
];

export const defaultWebsiteServices: WebsiteService[] = [
  { id: "computer-repairs", title: "Computer Repairs", requestType: "Computer repair", text: "Windows faults, slow computers, upgrades, OS installs, malware cleanup and data transfer.", icon: "laptop" },
  { id: "networking-nbn", title: "Networking & NBN", requestType: "Network or Wi-Fi", text: "Wi-Fi optimisation, routers, switches, NBN troubleshooting and reliable home or office networks.", icon: "network" },
  { id: "business-it", title: "Business IT & Planning", requestType: "Business IT", text: "Microsoft 365, networks, backups, security, equipment planning, and practical improvements for small and growing businesses.", icon: "business" },
  { id: "security", title: "Security", requestType: "Security", text: "MFA, endpoint protection, account security, backup strategy and recovery planning for small business.", icon: "shield" },
  { id: "remote-support", title: "Remote Support", requestType: "Remote support", text: "Fast diagnosis and support for problems that do not need an onsite visit.", icon: "remote" },
  { id: "hardware-upgrades", title: "Hardware & Upgrades", requestType: "Equipment enquiry", text: "Tested systems, SSD and memory upgrades, replacement hardware and setup assistance.", icon: "hardware" },
];
