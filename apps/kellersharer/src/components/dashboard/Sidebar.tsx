"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@stratos/auth";
import { Button, Avatar, Badge } from "@stratos/ui";
import {
  Home,
  Search,
  Plus,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  LayoutDashboard,
  Building2,
} from "lucide-react";
import type { UserType } from "@/types";

interface SidebarProps {
  userType: UserType;
}

export function Sidebar({ userType }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const renterLinks = [
    { href: "/app", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/app/spaces", icon: Building2, label: "My Spaces" },
    { href: "/app/spaces/new", icon: Plus, label: "Add Space" },
    { href: "/app/messages", icon: MessageSquare, label: "Messages" },
    { href: "/app/contracts", icon: FileText, label: "Contracts" },
    { href: "/app/settings", icon: Settings, label: "Settings" },
  ];

  const searcherLinks = [
    { href: "/app", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/app/browse", icon: Search, label: "Browse Spaces" },
    { href: "/app/searches", icon: Home, label: "My Searches" },
    { href: "/app/messages", icon: MessageSquare, label: "Messages" },
    { href: "/app/contracts", icon: FileText, label: "Contracts" },
    { href: "/app/settings", icon: Settings, label: "Settings" },
  ];

  const links = userType === "renter" ? renterLinks : searcherLinks;

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <span style={styles.logoIcon}>🏠</span>
        <span style={styles.logoText}>KellerSharer</span>
      </div>

      <div style={styles.userInfo}>
        <Avatar fallback={user?.email || "U"} size="md" />
        <div style={styles.userMeta}>
          <span style={styles.userName}>{user?.email?.split("@")[0]}</span>
          <Badge variant={userType === "renter" ? "success" : "info"} size="sm">
            {userType === "renter" ? "Space Owner" : "Space Seeker"}
          </Badge>
        </div>
      </div>

      <nav style={styles.nav}>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                ...styles.navLink,
                backgroundColor: isActive ? "#dcfce7" : "transparent",
                color: isActive ? "#16a34a" : "#4b5563",
              }}
            >
              <Icon size={20} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={styles.sidebarFooter}>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          style={styles.logoutBtn}
        >
          <LogOut size={18} />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: "260px",
    height: "100vh",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    left: 0,
    top: 0,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #e5e7eb",
  },
  logoIcon: {
    fontSize: "1.5rem",
  },
  logoText: {
    fontSize: "1.125rem",
    fontWeight: 700,
    color: "#111827",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "1rem 1.5rem",
    backgroundColor: "#f9fafb",
    margin: "1rem",
    borderRadius: "8px",
  },
  userMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  userName: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#111827",
  },
  nav: {
    flex: 1,
    padding: "0.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: 500,
    transition: "all 0.15s ease",
  },
  sidebarFooter: {
    padding: "1rem 1.5rem",
    borderTop: "1px solid #e5e7eb",
  },
  logoutBtn: {
    width: "100%",
    justifyContent: "flex-start",
    gap: "0.75rem",
    color: "#6b7280",
  },
};
