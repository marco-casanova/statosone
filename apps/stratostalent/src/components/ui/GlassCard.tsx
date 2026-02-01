"use client";

import { HTMLAttributes, forwardRef } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark" | "gradient";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  glow?: boolean;
  borderGradient?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      variant = "light",
      padding = "md",
      hover = false,
      glow = false,
      borderGradient = false,
      style,
      ...props
    },
    ref,
  ) => {
    const paddingMap: Record<string, string> = {
      none: "0",
      sm: "1rem",
      md: "1.5rem",
      lg: "2rem",
      xl: "2.5rem",
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      light: {
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: borderGradient ? "none" : "1px solid rgba(255, 255, 255, 0.3)",
      },
      dark: {
        background: "rgba(17, 24, 39, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: borderGradient ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
        color: "#ffffff",
      },
      gradient: {
        background:
          "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: borderGradient ? "none" : "1px solid rgba(59, 130, 246, 0.2)",
      },
    };

    const baseStyles: React.CSSProperties = {
      borderRadius: "var(--radius-2xl)",
      padding: paddingMap[padding],
      transition: "all var(--transition-base)",
      position: "relative",
      overflow: "hidden",
      boxShadow: glow ? "var(--shadow-glow)" : "var(--shadow-lg)",
      ...variantStyles[variant],
    };

    const hoverStyles = hover
      ? {
          cursor: "pointer",
        }
      : {};

    // For gradient border effect
    const wrapperStyle: React.CSSProperties | null = borderGradient
      ? {
          background: "var(--gradient-primary)",
          borderRadius: "var(--radius-2xl)",
          padding: "2px",
        }
      : null;

    const innerStyle: React.CSSProperties = {
      ...baseStyles,
      ...hoverStyles,
      ...style,
    };

    if (borderGradient) {
      return (
        <div style={wrapperStyle!}>
          <div ref={ref} style={innerStyle} {...props}>
            {children}
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} style={innerStyle} {...props}>
        {children}
      </div>
    );
  },
);

GlassCard.displayName = "GlassCard";
