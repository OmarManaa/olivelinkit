/* eslint-disable @next/next/no-img-element */
import { defaultWebsiteContent } from "./website-content-data";

type BrandLogoProps = {
  alt?: string;
  className?: string;
  src?: string;
};

export function BrandLogo({ alt = "", className = "", src = defaultWebsiteContent.logoUrl }: BrandLogoProps) {
  return (
    <span className={`brand-mark logo-mark ${className}`.trim()} aria-hidden="true">
      <img src={src || defaultWebsiteContent.logoUrl} alt={alt} height={1024} width={1024} />
    </span>
  );
}
