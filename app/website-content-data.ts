export type WebsiteStep = {
  number: string;
  title: string;
  text: string;
};

export type WebsiteContent = {
  brandTitle: string;
  brandSubtitle: string;
  headerCta: string;
  heroEyebrow: string;
  heroTitle: string;
  heroAccent: string;
  heroLead: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  trustItems: string[];
  processLabel: string;
  processSteps: WebsiteStep[];
  experienceValue: string;
  experienceLabel: string;
  servicesEyebrow: string;
  servicesTitle: string;
  servicesText: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutText: string;
  skills: string[];
  equipmentEyebrow: string;
  equipmentTitle: string;
  equipmentText: string;
  contactEyebrow: string;
  contactTitle: string;
  contactText: string;
  contactButton: string;
  contactEmail: string;
  whatsappNumber: string;
  locationText: string;
  footerText: string;
};

export const defaultWebsiteContent: WebsiteContent = {
  brandTitle: "Home & Small Business",
  brandSubtitle: "IT Services - Melbourne",
  headerCta: "Request support",
  heroEyebrow: "HOME - SMALL BUSINESS - REMOTE SUPPORT",
  heroTitle: "Reliable IT support,",
  heroAccent: "without the complexity.",
  heroLead: "Practical computer, network and business IT support from an experienced Melbourne systems engineer. Clear advice, professional service and solutions built to last.",
  heroPrimaryCta: "Get IT support",
  heroSecondaryCta: "Explore services",
  trustItems: ["Home and small business", "Melbourne based", "Remote and onsite"],
  processLabel: "IT support that fits the problem",
  processSteps: [
    { number: "01", title: "Diagnose", text: "Understand the cause before recommending work." },
    { number: "02", title: "Explain", text: "Plain-language options and pricing before proceeding." },
    { number: "03", title: "Resolve", text: "Repair, configure, test and document the outcome." },
  ],
  experienceValue: "15+ years",
  experienceLabel: "IT and systems experience",
  servicesEyebrow: "WHAT WE DO",
  servicesTitle: "Support for the technology you rely on.",
  servicesText: "From a single slow laptop to a small-business network, get practical help without enterprise-sized complexity.",
  aboutEyebrow: "EXPERIENCED. PRACTICAL. ACCOUNTABLE.",
  aboutTitle: "More than a repair shop.",
  aboutText: "Support informed by real systems engineering experience across Windows and Linux, networking, Microsoft 365, virtualisation, backup and disaster recovery.",
  skills: ["Windows and Linux", "Microsoft 365", "Networking and Wi-Fi", "Backup and Recovery", "VMware and Proxmox", "NAS and Storage"],
  equipmentEyebrow: "REFURBISHED AND TESTED",
  equipmentTitle: "Equipment ready for a second life.",
  equipmentText: "Professionally checked equipment with clear specifications, condition and warranty information before you buy.",
  contactEyebrow: "NEED A HAND?",
  contactTitle: "Tell us what's going wrong.",
  contactText: "Describe the problem and we'll help work out the best next step: remote support, onsite service or workshop repair.",
  contactButton: "Email a support request",
  contactEmail: "omar.manaa@gmail.com",
  whatsappNumber: "61401117746",
  locationText: "Melbourne, Victoria - By arrangement",
  footerText: "Home & Small Business IT Services - Melbourne",
};
