export type WebsiteStep = {
  number: string;
  title: string;
  text: string;
};

export type WebsiteAudience = {
  title: string;
  text: string;
};

export type WebsiteHighlight = {
  title: string;
  text: string;
};

export type WebsiteTestimonial = {
  quote: string;
  name: string;
  context: string;
};

export type WebsiteThemePreset = "olive" | "ocean" | "slate" | "gold" | "custom";

export type WebsiteTheme = {
  preset: WebsiteThemePreset;
  primaryColor: string;
  secondaryColor: string;
  darkColor: string;
  accentColor: string;
  successColor: string;
};

export type WebsiteContent = {
  brandTitle: string;
  brandSubtitle: string;
  logoUrl: string;
  faviconUrl: string;
  logoAlt: string;
  showBrandText: boolean;
  headerCta: string;
  heroEyebrow: string;
  heroTitle: string;
  heroAccent: string;
  heroLead: string;
  heroImageUrl: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  trustItems: string[];
  serviceHighlights: WebsiteHighlight[];
  testimonialEyebrow: string;
  testimonialTitle: string;
  testimonialText: string;
  testimonials: WebsiteTestimonial[];
  processLabel: string;
  processSteps: WebsiteStep[];
  experienceValue: string;
  experienceLabel: string;
  supportEyebrow: string;
  supportTitle: string;
  supportText: string;
  supportPoints: string[];
  servicesEyebrow: string;
  servicesTitle: string;
  servicesText: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutText: string;
  aboutAudienceTitle: string;
  aboutAudienceText: string;
  skills: string[];
  equipmentEyebrow: string;
  equipmentTitle: string;
  equipmentText: string;
  audienceEyebrow: string;
  audienceTitle: string;
  audienceText: string;
  audienceItems: WebsiteAudience[];
  consultingEyebrow: string;
  consultingTitle: string;
  consultingText: string;
  consultingCta: string;
  contactEyebrow: string;
  contactTitle: string;
  contactText: string;
  contactButton: string;
  contactEmail: string;
  whatsappNumber: string;
  locationText: string;
  businessHours: string;
  responseExpectation: string;
  businessLegalName: string;
  businessAddress: string;
  businessAbn: string;
  businessPhone: string;
  invoiceEmail: string;
  invoiceIsTaxInvoice: boolean;
  invoicePaymentInstructions: string;
  invoiceFooterNote: string;
  footerText: string;
  theme: WebsiteTheme;
};

export const websiteThemePresets: Record<Exclude<WebsiteThemePreset, "custom">, WebsiteTheme> = {
  olive: {
    preset: "olive",
    primaryColor: "#2563eb",
    secondaryColor: "#0f766e",
    darkColor: "#111827",
    accentColor: "#b7791f",
    successColor: "#15803d",
  },
  ocean: {
    preset: "ocean",
    primaryColor: "#0f6b99",
    secondaryColor: "#0f766e",
    darkColor: "#102a43",
    accentColor: "#d89b1d",
    successColor: "#168064",
  },
  slate: {
    preset: "slate",
    primaryColor: "#334155",
    secondaryColor: "#0f766e",
    darkColor: "#0f172a",
    accentColor: "#a16207",
    successColor: "#15803d",
  },
  gold: {
    preset: "gold",
    primaryColor: "#17446a",
    secondaryColor: "#3f6212",
    darkColor: "#111827",
    accentColor: "#b7791f",
    successColor: "#166534",
  },
};

export const defaultWebsiteContent: WebsiteContent = {
  brandTitle: "OliveLink IT",
  brandSubtitle: "Melbourne IT support for homes and growing businesses",
  logoUrl: "/brand/olivelinkit-bubble-logo.png",
  faviconUrl: "/brand/olivelinkit-bubble-logo.png",
  logoAlt: "OliveLink IT logo",
  showBrandText: true,
  headerCta: "Request support",
  heroEyebrow: "IT SUPPORT AND PRACTICAL TECHNOLOGY ADVICE",
  heroTitle: "Reliable IT support,",
  heroAccent: "without the complexity.",
  heroLead: "Practical IT support and clear technology advice for individuals, small businesses and growing teams across Melbourne. Get the right next step without enterprise-sized complexity.",
  heroImageUrl: "/hero-it-support.webp",
  heroPrimaryCta: "Get IT support",
  heroSecondaryCta: "Explore services",
  trustItems: ["Individuals to medium business", "Melbourne based", "Remote and onsite"],
  serviceHighlights: [
    { title: "Clear next step", text: "A practical assessment before time or money is wasted." },
    { title: "Melbourne and remote", text: "Help where it is needed, from home offices to growing teams." },
    { title: "Straightforward scope", text: "Options and pricing explained before work proceeds." },
  ],
  testimonialEyebrow: "CUSTOMER FEEDBACK",
  testimonialTitle: "Practical help should feel straightforward.",
  testimonialText: "Approved feedback from customers can be shown here when it is ready to publish.",
  testimonials: [],
  processLabel: "IT support that fits the problem",
  processSteps: [
    { number: "01", title: "Diagnose", text: "Understand the cause before recommending work." },
    { number: "02", title: "Explain", text: "Plain-language options and pricing before proceeding." },
    { number: "03", title: "Resolve", text: "Repair, configure, test and document the outcome." },
  ],
  experienceValue: "15+ years",
  experienceLabel: "IT and systems experience",
  supportEyebrow: "QUICK INTAKE",
  supportTitle: "Start with the right details.",
  supportText: "Choose what you need, add the key symptoms, then send it through the best channel.",
  supportPoints: ["Remote help", "Onsite visits", "Quote ready"],
  servicesEyebrow: "WHAT WE DO",
  servicesTitle: "Support for the technology you rely on.",
  servicesText: "From a single slow laptop to a small-business network, get practical help without enterprise-sized complexity.",
  aboutEyebrow: "EXPERIENCED. PRACTICAL. ACCOUNTABLE.",
  aboutTitle: "More than a repair shop.",
  aboutText: "Support informed by real systems engineering experience across Windows and Linux, networking, Microsoft 365, virtualisation, backup and disaster recovery.",
  aboutAudienceTitle: "Home to growing business",
  aboutAudienceText: "Support scaled to the way you actually work.",
  skills: ["Windows and Linux", "Microsoft 365", "Networking and Wi-Fi", "Backup and Recovery", "VMware and Proxmox", "NAS and Storage"],
  equipmentEyebrow: "REFURBISHED AND TESTED",
  equipmentTitle: "Equipment ready for a second life.",
  equipmentText: "Professionally checked equipment with clear condition, stock and pricing before you enquire.",
  audienceEyebrow: "WHO WE HELP",
  audienceTitle: "Support that fits the way you work.",
  audienceText: "From one laptop at home to a growing business with staff, sites, and suppliers, get practical help matched to the scale of the problem.",
  audienceItems: [
    { title: "Individuals", text: "Computer repairs, home Wi-Fi, email, new-device setup, data recovery, and plain-language help." },
    { title: "Small businesses", text: "Microsoft 365, staff devices, backups, cybersecurity, reliable Wi-Fi, and day-to-day support." },
    { title: "Growing and medium businesses", text: "Technology reviews, network improvements, equipment planning, vendor coordination, and scalable systems." },
  ],
  consultingEyebrow: "PLAN BEFORE YOU SPEND",
  consultingTitle: "Practical IT planning for the next sensible improvement.",
  consultingText: "Get clear advice before buying equipment, changing providers, moving email, improving security, or expanding the network. The goal is a workable plan, not a sales pitch.",
  consultingCta: "Discuss your IT setup",
  contactEyebrow: "NEED A HAND?",
  contactTitle: "Tell us what's going wrong.",
  contactText: "Describe the problem and we'll help work out the best next step: remote support, onsite service or workshop repair.",
  contactButton: "Email a support request",
  contactEmail: "omar.manaa@gmail.com",
  whatsappNumber: "61401117746",
  locationText: "Melbourne, Victoria - By arrangement",
  businessHours: "Service by appointment",
  responseExpectation: "Clear next steps after we review your request",
  businessLegalName: "OliveLink IT",
  businessAddress: "Melbourne, Victoria",
  businessAbn: "",
  businessPhone: "",
  invoiceEmail: "omar.manaa@gmail.com",
  invoiceIsTaxInvoice: true,
  invoicePaymentInstructions: "Payment details provided on request.",
  invoiceFooterNote: "Thank you for your business.",
  footerText: "OliveLink IT - Melbourne",
  theme: websiteThemePresets.olive,
};

export function mergeWebsiteContent(input: Partial<WebsiteContent>): WebsiteContent {
  return {
    ...defaultWebsiteContent,
    ...input,
    theme: { ...defaultWebsiteContent.theme, ...input.theme },
    trustItems: input.trustItems?.length ? input.trustItems : defaultWebsiteContent.trustItems,
    serviceHighlights: input.serviceHighlights?.length ? input.serviceHighlights : defaultWebsiteContent.serviceHighlights,
    testimonials: input.testimonials?.length ? input.testimonials : defaultWebsiteContent.testimonials,
    processSteps: input.processSteps?.length ? input.processSteps : defaultWebsiteContent.processSteps,
    skills: input.skills?.length ? input.skills : defaultWebsiteContent.skills,
    audienceItems: input.audienceItems?.length ? input.audienceItems : defaultWebsiteContent.audienceItems,
    supportPoints: input.supportPoints?.length ? input.supportPoints : defaultWebsiteContent.supportPoints,
  };
}
