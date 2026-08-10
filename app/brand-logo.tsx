import Image from "next/image";

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <span className={`brand-mark logo-mark ${className}`.trim()} aria-hidden="true">
      <Image src="/brand/olivelinkit-palestine-map-logo-mark.png" alt="" height={512} width={512} unoptimized />
    </span>
  );
}
