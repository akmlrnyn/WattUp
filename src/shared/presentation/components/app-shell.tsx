import {
  AdminNavigationLink,
  DesktopNavigation,
  MobileNavigation,
} from "./app-navigation";
import { BrandMark } from "./brand-mark";

interface AppShellProps {
  userName: string;
  isAdmin: boolean;
  children: React.ReactNode;
}

function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] || "Pengguna";
}

export function AppShell({
  userName,
  isAdmin,
  children,
}: AppShellProps) {
  const firstName = getFirstName(userName);

  return (
    <div className="app-shell">
      <aside className="desktop-sidebar">
        <div className="sidebar-brand">
          <BrandMark />

          <div>
            <strong>WattUp</strong>
            <span>#ShiftMalam Challenge</span>
          </div>
        </div>

        <DesktopNavigation />

        {isAdmin ? (
          <div className="sidebar-footer">
            <AdminNavigationLink />
          </div>
        ) : null}
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="mobile-brand">
            <BrandMark small />
          </div>

          <div className="topbar-user">
            <span>Selamat datang,</span>
            <strong>{firstName}</strong>
          </div>

          <div className="topbar-avatar">
            {firstName.charAt(0).toUpperCase()}
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>

      <MobileNavigation />
    </div>
  );
}