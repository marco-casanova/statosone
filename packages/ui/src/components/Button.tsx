import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: {
      backgroundColor: "#2563eb",
      color: "#ffffff",
      border: "none",
    },
    secondary: {
      backgroundColor: "#f3f4f6",
      color: "#374151",
      border: "none",
    },
    outline: {
      backgroundColor: "transparent",
      color: "#2563eb",
      border: "2px solid #2563eb",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "#374151",
      border: "none",
    },
    danger: {
      backgroundColor: "#dc2626",
      color: "#ffffff",
      border: "none",
    },
  };

  const sizeStyles = {
    sm: {
      padding: "0.375rem 0.75rem",
      fontSize: "0.875rem",
    },
    md: {
      padding: "0.5rem 1rem",
      fontSize: "1rem",
    },
    lg: {
      padding: "0.75rem 1.5rem",
      fontSize: "1.125rem",
    },
  };

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    fontWeight: 500,
    borderRadius: "0.5rem",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.5 : 1,
    transition: "all 0.2s",
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <button style={baseStyle} disabled={disabled || loading} {...props}>
      {loading && <Spinner size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: "spin 1s linear infinite" }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
