export type WebsitePortfolioItem = {
  id: string;
  title: string;
  description: string;
  url: string;
  button: string;
  imageUrl?: string;
};

export const defaultWebsitePortfolio: WebsitePortfolioItem[] = [
  {
    id: "portfolio-restore-cupping",
    title: "Restore Cupping",
    description:
      "Live health and wet cupping website built for local wellness clients with clear service pages, appointment focus, and easy mobile navigation.",
    url: "https://restore-cupping.com/",
    button: "Visit site",
  },
];
