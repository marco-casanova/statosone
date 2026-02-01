"use client";

import { Button, Badge } from "@stratos/ui";
import { Bell, Search } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header style={styles.header}>
      <div style={styles.titleSection}>
        <h1 style={styles.title}>{title}</h1>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>

      <div style={styles.actions}>
        <div style={styles.searchBox}>
          <Search size={18} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search..."
            style={styles.searchInput}
          />
        </div>

        <Button variant="ghost" size="sm" style={styles.iconBtn}>
          <Bell size={20} />
          <Badge variant="danger" size="sm" style={styles.notifBadge}>
            3
          </Badge>
        </Button>

        {actions}
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1.25rem 2rem",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
  },
  titleSection: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: 0,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    minWidth: "200px",
  },
  searchInput: {
    border: "none",
    background: "none",
    outline: "none",
    fontSize: "0.875rem",
    width: "100%",
    color: "#111827",
  },
  iconBtn: {
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: "0",
    right: "0",
    transform: "translate(25%, -25%)",
  },
};
