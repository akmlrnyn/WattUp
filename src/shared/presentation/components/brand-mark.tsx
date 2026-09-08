import Image from "next/image";

interface BrandMarkProps {
  small?: boolean;
}

interface BrandWordmarkProps {
  className?: string;
  priority?: boolean;
}

export function BrandMark({
  small = false,
}: BrandMarkProps) {
  return (
    <span
      className={`brand-mark ${
        small ? "small" : ""
      }`}
    >
      <Image
        src="/icons/wattup-icon-192.png"
        alt=""
        width={192}
        height={192}
        sizes={small ? "39px" : "44px"}
        priority
      />
    </span>
  );
}

export function BrandWordmark({
  className = "",
  priority = false,
}: BrandWordmarkProps) {
  return (
    <span
      className={`brand-wordmark ${className}`.trim()}
    >
      <Image
        src="/brand/wattup-logo.png"
        alt="WattUp"
        width={960}
        height={412}
        sizes="(max-width: 767px) 128px, 150px"
        priority={priority}
      />
    </span>
  );
}