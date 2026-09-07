import { Zap } from "lucide-react";

interface BrandMarkProps {
  small?: boolean;
}

export function BrandMark({ small = false }: BrandMarkProps) {
  return (
    <span className={`brand-mark ${small ? "small" : ""}`}>
      <Zap aria-hidden size={small ? 20 : 23} fill="currentColor" />
    </span>
  );
}