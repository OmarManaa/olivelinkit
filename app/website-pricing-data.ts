export type WebsitePricingGroup = {
  id: string;
  title: string;
  summary: string;
};

export type WebsitePricingItem = {
  id: string;
  groupId: string;
  title: string;
  requestType: string;
  price: string;
  turnaround: string;
  description: string;
  scope: string[];
  finePrint: string;
  visible: boolean;
};

export type WebsitePricingContent = {
  eyebrow: string;
  title: string;
  intro: string;
  disclaimer: string;
  groups: WebsitePricingGroup[];
  items: WebsitePricingItem[];
};

export const pricingRequestTypes = [
  "Computer repair",
  "Password/access help",
  "OS reinstall/setup",
  "Data recovery",
  "Backup setup",
  "Network or Wi-Fi",
  "Microsoft 365 or email",
  "Security",
  "Remote support",
  "Business IT",
  "Quote request",
];

export const defaultWebsitePricing: WebsitePricingContent = {
  eyebrow: "REPAIR AND SUPPORT PRICING",
  title: "Clear starting prices for common IT work.",
  intro: "Use these prices as a practical guide for standard jobs. If the fault is complex, physically damaged, encrypted, or needs parts, we confirm the scope and quote before proceeding.",
  disclaimer: "Prices are in AUD and include standard labour scope only. Parts, licences, replacement drives, specialist lab recovery, unusual travel, and after-hours work are quoted before proceeding. Proof of ownership is required for password and data recovery work.",
  groups: [
    { id: "everyday-help", title: "Everyday IT Help", summary: "Remote and onsite support for common software, speed, malware, and setup problems." },
    { id: "repair-reinstall", title: "Computer Repair & Reinstall", summary: "Practical repair work for Windows, Linux, upgrades, and safe operating system rebuilds." },
    { id: "data-backup", title: "Data, Backup & Recovery", summary: "Careful handling for transfers, deleted files, backups, and recovery triage." },
    { id: "business-support", title: "Small Business Support", summary: "Clear support options for workstations, networks, users, and practical security basics." },
  ],
  items: [
    {
      id: "quick-remote",
      groupId: "everyday-help",
      title: "Quick remote support",
      requestType: "Remote support",
      price: "$45 / 30 min",
      turnaround: "Same day where available",
      description: "Short remote help for software issues, settings, email, printer checks, and quick troubleshooting.",
      scope: ["Secure remote session", "Basic diagnosis and fix attempt", "Plain-language next steps"],
      finePrint: "Best for problems that do not require hands-on hardware work.",
      visible: true,
    },
    {
      id: "onsite-troubleshooting",
      groupId: "everyday-help",
      title: "Onsite troubleshooting",
      requestType: "Computer repair",
      price: "$120 first hour",
      turnaround: "Usually 1 to 2 hours",
      description: "A home or office visit to inspect the issue, explain options, and complete straightforward fixes.",
      scope: ["Initial diagnosis", "One hour onsite labour", "Quote before extra time or parts"],
      finePrint: "Additional time can be charged in 30-minute blocks by agreement.",
      visible: true,
    },
    {
      id: "slow-computer-tuneup",
      groupId: "everyday-help",
      title: "Slow computer tune-up",
      requestType: "Computer repair",
      price: "$99 - $149",
      turnaround: "Same or next business day",
      description: "Performance review, startup cleanup, updates, storage checks, and practical advice on whether upgrades are worthwhile.",
      scope: ["Health and startup review", "Software cleanup", "Update and storage checks"],
      finePrint: "Does not include hardware parts or operating system reinstall.",
      visible: true,
    },
    {
      id: "malware-cleanup",
      groupId: "everyday-help",
      title: "Virus and malware cleanup",
      requestType: "Security",
      price: "$149 - $220",
      turnaround: "Usually same day",
      description: "Malware checks, browser cleanup, suspicious app removal, security updates, and account safety guidance.",
      scope: ["Malware scan and cleanup", "Browser and startup checks", "Security recommendations"],
      finePrint: "Severe ransomware or business compromise is assessed and quoted separately.",
      visible: true,
    },
    {
      id: "local-password-recovery",
      groupId: "repair-reinstall",
      title: "Local Windows or Linux password recovery",
      requestType: "Password/access help",
      price: "From $120",
      turnaround: "Usually same day",
      description: "Help regaining access to a local Windows or Linux computer account where ownership can be verified.",
      scope: ["Ownership check", "Local account recovery attempt", "Access and security advice"],
      finePrint: "Encrypted drives, BitLocker, FileVault, Microsoft, Apple, or Google accounts require the official recovery process or recovery key.",
      visible: true,
    },
    {
      id: "windows-reinstall",
      groupId: "repair-reinstall",
      title: "Windows reinstall with backup",
      requestType: "OS reinstall/setup",
      price: "$249 - $349",
      turnaround: "1 to 2 business days",
      description: "A clean Windows rebuild with reasonable user data backup and restore for a healthier, safer machine.",
      scope: ["Data backup up to 100GB", "Windows reinstall and updates", "Drivers and essential app setup"],
      finePrint: "Software licences, large data sets, failed drives, and specialist apps are quoted separately.",
      visible: true,
    },
    {
      id: "linux-install",
      groupId: "repair-reinstall",
      title: "Linux install or reinstall",
      requestType: "OS reinstall/setup",
      price: "$149 - $229",
      turnaround: "Same or next business day",
      description: "Linux installation or rebuild for compatible laptops and desktops, with basic updates and driver checks.",
      scope: ["Distribution selection advice", "Install and update", "Basic hardware compatibility checks"],
      finePrint: "Dual boot, encryption, specialist software, and advanced partition work are quoted separately.",
      visible: true,
    },
    {
      id: "ssd-upgrade-clone",
      groupId: "repair-reinstall",
      title: "SSD upgrade and clone",
      requestType: "Computer repair",
      price: "$179 - $349 + parts",
      turnaround: "1 to 2 business days",
      description: "Upgrade a slow hard drive to SSD and clone the existing system where the old drive is healthy enough.",
      scope: ["Drive health check", "Clone or rebuild recommendation", "Install, test, and handover"],
      finePrint: "SSD hardware and recovery from failing drives are quoted separately.",
      visible: true,
    },
    {
      id: "data-transfer",
      groupId: "data-backup",
      title: "Data transfer to a new computer",
      requestType: "Backup setup",
      price: "$110 - $180",
      turnaround: "Usually same day",
      description: "Move common user files from an old computer or external drive to a new device.",
      scope: ["Documents, photos, and desktop data", "Folder structure check", "Basic verification"],
      finePrint: "Applications, licences, email archives, and large data sets may need a separate quote.",
      visible: true,
    },
    {
      id: "deleted-file-recovery",
      groupId: "data-backup",
      title: "Deleted file recovery from a healthy drive",
      requestType: "Data recovery",
      price: "$150 - $350",
      turnaround: "1 to 3 business days",
      description: "Logical recovery attempt for accidentally deleted files or simple file-system issues on a drive that still works.",
      scope: ["Read-only recovery approach", "Recoverable file review", "Copy recovered files to supplied storage"],
      finePrint: "Stop using the device as soon as files are lost. SSD recovery can be limited by TRIM and encryption.",
      visible: true,
    },
    {
      id: "drive-recovery-assessment",
      groupId: "data-backup",
      title: "Failed drive recovery assessment",
      requestType: "Data recovery",
      price: "From $90",
      turnaround: "Quote first",
      description: "Initial triage for laptops, external hard drives, and SSDs that are not reading normally.",
      scope: ["Non-invasive assessment", "Risk and recoverability advice", "Specialist referral when needed"],
      finePrint: "Clicking, liquid damaged, opened, or physically failed drives may need a specialist lab quote.",
      visible: true,
    },
    {
      id: "backup-setup",
      groupId: "data-backup",
      title: "Backup setup",
      requestType: "Backup setup",
      price: "$149 - $299",
      turnaround: "Same or next business day",
      description: "Set up practical backups for important files, with a restore check and simple handover notes.",
      scope: ["Backup target setup", "First backup check", "Restore test where practical"],
      finePrint: "Cloud subscriptions, external drives, NAS hardware, and Microsoft 365 tenant backup are quoted separately.",
      visible: true,
    },
    {
      id: "business-onsite",
      groupId: "business-support",
      title: "Small business onsite support",
      requestType: "Business IT",
      price: "$150/hr",
      turnaround: "By appointment",
      description: "Ad-hoc support for workstations, printers, Wi-Fi, accounts, updates, and practical business IT issues.",
      scope: ["One-hour minimum", "Remote or onsite options", "Quote before projects or parts"],
      finePrint: "Project work, migrations, cabling, hardware, and after-hours support are quoted separately.",
      visible: true,
    },
    {
      id: "workstation-setup",
      groupId: "business-support",
      title: "Business workstation setup",
      requestType: "Business IT",
      price: "$250 - $450",
      turnaround: "1 to 2 business days",
      description: "Set up a staff laptop or desktop with accounts, updates, essential apps, printers, and basic security.",
      scope: ["User account setup", "Updates and essential apps", "Printer and network checks"],
      finePrint: "Microsoft 365 licensing, data migration, line-of-business apps, and device purchase are quoted separately.",
      visible: true,
    },
    {
      id: "wifi-network-setup",
      groupId: "business-support",
      title: "Wi-Fi and network setup",
      requestType: "Network or Wi-Fi",
      price: "$149 - $299",
      turnaround: "Usually same day",
      description: "Router, Wi-Fi, mesh, printer, and basic network setup for homes, home offices, and small workplaces.",
      scope: ["Router or mesh setup", "Device connection checks", "Basic coverage and security review"],
      finePrint: "Hardware, cabling, advanced VLANs, VPNs, and larger network redesigns are quoted separately.",
      visible: true,
    },
  ],
};

function mergeGroups(groups: WebsitePricingGroup[] | undefined) {
  if (!groups?.length) return defaultWebsitePricing.groups;
  return groups.map((group, index) => ({
    ...defaultWebsitePricing.groups[index % defaultWebsitePricing.groups.length],
    ...group,
  }));
}

function mergeItems(items: WebsitePricingItem[] | undefined) {
  if (!items?.length) return defaultWebsitePricing.items;
  return items.map((item, index) => ({
    ...defaultWebsitePricing.items[index % defaultWebsitePricing.items.length],
    ...item,
    scope: item.scope?.length ? item.scope : defaultWebsitePricing.items[index % defaultWebsitePricing.items.length].scope,
    visible: item.visible !== false,
  }));
}

export function mergeWebsitePricing(input: Partial<WebsitePricingContent>): WebsitePricingContent {
  return {
    ...defaultWebsitePricing,
    ...input,
    groups: mergeGroups(input.groups),
    items: mergeItems(input.items),
  };
}
