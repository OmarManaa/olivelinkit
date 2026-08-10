import Image from "next/image";

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <span className={`brand-mark logo-mark ${className}`.trim()} aria-hidden="true">
      <Image src="/brand/olivelinkit-bubble-logo.png" alt="" height={1024} width={1024} unoptimized />
    </span>
  );
}
