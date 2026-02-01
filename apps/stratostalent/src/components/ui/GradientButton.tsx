"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const GradientButton = forwardRef<
  HTMLButtonElement,
  GradientButtonProps
>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      icon,
      iconPosition = "left",
      style,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      fontWeight: 600,
      borderRadius: "var(--radius-xl)",
      border: "none",
      cursor: disabled || loading ? "not-allowed" : "pointer",
      transition: "all var(--transition-base)",
      position: "relative",
      overflow: "hidden",
      width: fullWidth ? "100%" : "auto",
      opacity: disabled || loading ? 0.6 : 1,
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { padding: "0.5rem 1rem", fontSize: "0.875rem" },
      md: { padding: "0.75rem 1.5rem", fontSize: "0.9375rem" },
      lg: { padding: "1rem 2rem", fontSize: "1rem" },
      xl: { padding: "1.25rem 2.5rem", fontSize: "1.125rem" },
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: "var(--gradient-primary)",
        color: "#ffffff",
        boxShadow: "var(--shadow-lg), 0 0 20px rgba(59, 130, 246, 0.3)",
      },
      secondary: {
        background: "var(--gradient-secondary)",
        color: "#ffffff",
        boxShadow: "var(--shadow-lg), 0 0 20px rgba(139, 92, 246, 0.3)",
      },
      accent: {
        background: "var(--gradient-accent)",
        color: "#ffffff",
        boxShadow: "var(--shadow-lg), 0 0 20px rgba(16, 185, 129, 0.3)",
      },
      outline: {
        background: "transparent",
        color: "var(--primary-600)",
        border: "2px solid var(--primary-500)",
        boxShadow: "var(--shadow-sm)",
      },
      ghost: {
        background: "transparent",
        color: "var(--gray-700)",
      },
    };

    return (
      <button
        ref={ref}
        style={{
          ...baseStyles,
          ...sizeStyles[size],
          ...variantStyles[variant],
          ...style,
        }}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            style={{
              width: "1rem",
              height: "1rem",
              animation: "spin 1s linear infinite",
            }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              strokeOpacity="0.25"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        )}
        {!loading && icon && iconPosition === "left" && icon}
        {children}
        {!loading && icon && iconPosition === "right" && icon}
      </button>
    );
  },
);

GradientButton.displayName = "GradientButton";
