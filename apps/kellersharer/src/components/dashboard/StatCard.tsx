"use client";

import { Card, Badge } from "@stratos/ui";
import type { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger";
}

export function StatCard({
  icon,
  label,
  value,
  trend,
  variant = "default",
}: StatCardProps) {
  const colors = {
    default: { bg: "#f3f4f6", icon: "#6b7280" },
    success: { bg: "#dcfce7", icon: "#16a34a" },
    warning: { bg: "#fef3c7", icon: "#d97706" },
    danger: { bg: "#fee2e2", icon: "#dc2626" },
  };

  return (
    <Card padding="lg" style={styles.card}>
      <div
        style={{ ...styles.iconWrapper, backgroundColor: colors[variant].bg }}
      >
        {icon}
      </div>
      <div style={styles.content}>
        <span style={styles.label}>{label}</span>
        <div style={styles.valueRow}>
          <span style={styles.value}>{value}</span>
          {trend && (
            <Badge variant={trend.isPositive ? "success" : "danger"} size="sm">
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  iconWrapper: {
    padding: "0.75rem",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  label: {
    fontSize: "0.8rem",
    color: "#6b7280",
    fontWeight: 500,
  },
  valueRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  value: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#111827",
  },
};
