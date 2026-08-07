import type { ServiceIconKey } from "./website-services-data";

type ServiceIconProps = {
  icon: ServiceIconKey;
};

export function ServiceIcon({ icon }: ServiceIconProps) {
  if (icon === "network") return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 17h12M8 17v3m8-3v3M12 4v5m-6 4h12M6 13V9h12v4" /></svg>;
  if (icon === "business") return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 20V6l7-3 7 3v14M9 9h1m4 0h1M9 13h1m4 0h1M9 17h1m4 0h1" /></svg>;
  if (icon === "shield") return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 21s7-3 7-10V5l-7-3-7 3v6c0 7 7 10 7 10zM9 12l2 2 4-5" /></svg>;
  if (icon === "remote") return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 5h16v11H4zM8 20h8M12 16v4M9 10h6" /></svg>;
  if (icon === "hardware") return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 7h10v10H7zM4 10h3m10 0h3M4 14h3m10 0h3M10 4v3m4-3v3m-4 10v3m4-3v3" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 6h14v10H5zM8 20h8M12 16v4M15 9l-4 4M11 9h4v4" /></svg>;
}
