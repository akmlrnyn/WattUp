"use client";

import {
  CircleDot,
  Home,
  ShieldCheck,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navigationItems: NavigationItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/sessions/new", label: "Catat", icon: Zap },
  { href: "/leaderboard", label: "Papan", icon: Trophy },
  { href: "/challenge", label: "Challenge", icon: CircleDot },
];

function useNavigationItems() {
  const pathname = usePathname();

  return navigationItems.map((item) => ({
    ...item,
    active:
      item.href === "/dashboard"
        ? pathname === item.href
        : pathname.startsWith(item.href),
  }));
}

export function DesktopNavigation() {
  const items = useNavigationItems();

  return (
    <nav className="desktop-navigation" aria-label="Navigasi utama">
      {items.map(({ href, label, icon: Icon, active }) => (
        <Link key={href} href={href} className={active ? "active" : ""}>
          <Icon aria-hidden size={20} strokeWidth={1.8} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function MobileNavigation() {
  const items = useNavigationItems();

  return (
    <nav className="mobile-navigation" aria-label="Navigasi utama">
      {items.map(({ href, label, icon: Icon, active }) => (
        <Link key={href} href={href} className={active ? "active" : ""}>
          <Icon aria-hidden size={21} strokeWidth={1.8} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function AdminNavigationLink() {
  return (
    <Link className="admin-navigation-link" href="/admin">
      <ShieldCheck aria-hidden size={19} />
      <span>Admin Dashboard</span>
    </Link>
  );
}