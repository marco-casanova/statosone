"use client";

import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "warning"
    | "error"
    | "outline";
  size?: "xs" | "sm" | "md";
  dot?: boolean;
  pulse?: boolean;
  icon?: React.ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = "default",
      size = "sm",
      dot = false,
      pulse = false,
      icon,
      style,
      ...props
    },
    ref,
  ) => {
    const sizeStyles: Record<string, React.CSSProperties> = {
      xs: { padding: "0.125rem 0.5rem", fontSize: "0.625rem" },
      sm: { padding: "0.25rem 0.75rem", fontSize: "0.75rem" },
      md: { padding: "0.375rem 1rem", fontSize: "0.875rem" },
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        background: "var(--gray-100)",
        color: "var(--gray-700)",
      },
      primary: {
        background: "var(--primary-100)",
        color: "var(--primary-700)",
      },
      secondary: {
        background: "var(--secondary-100)",
        color: "var(--secondary-700)",
      },
      accent: {
        background: "var(--accent-100)",
        color: "var(--accent-700)",
      },
      success: {
        background: "rgba(16, 185, 129, 0.1)",
        color: "var(--accent-600)",
      },
      warning: {
        background: "rgba(245, 158, 11, 0.1)",
        color: "#d97706",
      },
      error: {
        background: "rgba(239, 68, 68, 0.1)",
        color: "var(--error)",
      },
      outline: {
        background: "transparent",
        color: "var(--gray-600)",
        border: "1px solid var(--gray-300)",
      },
    };

    const baseStyles: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.375rem",
      fontWeight: 500,
      borderRadius: "var(--radius-full)",
      whiteSpace: "nowrap",
      transition: "all var(--transition-fast)",
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };

    const dotStyles: React.CSSProperties = {
      width: "0.375rem",
      height: "0.375rem",
      borderRadius: "var(--radius-full)",
      background: "currentColor",
      animation: pulse ? "pulse-glow 2s ease-in-out infinite" : "none",
    };

    return (
      <span ref={ref} style={baseStyles} {...props}>
        {dot && <span style={dotStyles} />}
        {icon}
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";
