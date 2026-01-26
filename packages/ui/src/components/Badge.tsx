import type { HTMLAttributes, ReactNode } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  children: ReactNode;
}

export function Badge({
  variant = "default",
  size = "md",
  children,
  style,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: {
      backgroundColor: "#f3f4f6",
      color: "#374151",
    },
    success: {
      backgroundColor: "#dcfce7",
      color: "#166534",
    },
    warning: {
      backgroundColor: "#fef3c7",
      color: "#92400e",
    },
    error: {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
    },
    info: {
      backgroundColor: "#dbeafe",
      color: "#1e40af",
    },
  };

  const sizeStyles = {
    sm: {
      padding: "0.125rem 0.5rem",
      fontSize: "0.75rem",
    },
    md: {
      padding: "0.25rem 0.75rem",
      fontSize: "0.875rem",
    },
  };

  const badgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "9999px",
    fontWeight: 500,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <span style={badgeStyle} {...props}>
      {children}
    </span>
  );
}
