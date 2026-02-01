"use client";

import { HTMLAttributes, forwardRef } from "react";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  status?: "online" | "offline" | "busy" | "away";
  verified?: boolean;
  ring?: boolean;
  ringColor?: string;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = "Avatar",
      name,
      size = "md",
      status,
      verified = false,
      ring = false,
      ringColor = "var(--primary-500)",
      style,
      ...props
    },
    ref,
  ) => {
    const sizeMap: Record<
      string,
      {
        size: string;
        fontSize: string;
        statusSize: string;
        verifiedSize: string;
      }
    > = {
      xs: {
        size: "1.5rem",
        fontSize: "0.625rem",
        statusSize: "0.5rem",
        verifiedSize: "0.75rem",
      },
      sm: {
        size: "2rem",
        fontSize: "0.75rem",
        statusSize: "0.625rem",
        verifiedSize: "0.875rem",
      },
      md: {
        size: "2.5rem",
        fontSize: "0.875rem",
        statusSize: "0.75rem",
        verifiedSize: "1rem",
      },
      lg: {
        size: "3.5rem",
        fontSize: "1.125rem",
        statusSize: "0.875rem",
        verifiedSize: "1.25rem",
      },
      xl: {
        size: "5rem",
        fontSize: "1.5rem",
        statusSize: "1rem",
        verifiedSize: "1.5rem",
      },
      "2xl": {
        size: "7rem",
        fontSize: "2rem",
        statusSize: "1.25rem",
        verifiedSize: "1.75rem",
      },
    };

    const statusColors: Record<string, string> = {
      online: "var(--accent-500)",
      offline: "var(--gray-400)",
      busy: "var(--error)",
      away: "var(--warning)",
    };

    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    };

    const currentSize = sizeMap[size];

    const containerStyles: React.CSSProperties = {
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: currentSize.size,
      height: currentSize.size,
      borderRadius: "var(--radius-full)",
      background: src ? "transparent" : "var(--gradient-primary)",
      color: "#ffffff",
      fontSize: currentSize.fontSize,
      fontWeight: 600,
      flexShrink: 0,
      boxShadow: ring ? `0 0 0 3px ${ringColor}` : "var(--shadow-sm)",
      ...style,
    };

    const imageStyles: React.CSSProperties = {
      width: "100%",
      height: "100%",
      borderRadius: "var(--radius-full)",
      objectFit: "cover",
    };

    const statusStyles: React.CSSProperties = {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: currentSize.statusSize,
      height: currentSize.statusSize,
      borderRadius: "var(--radius-full)",
      background: status ? statusColors[status] : "transparent",
      border: "2px solid white",
      boxShadow: "var(--shadow-sm)",
    };

    const verifiedStyles: React.CSSProperties = {
      position: "absolute",
      bottom: "-2px",
      right: "-2px",
      width: currentSize.verifiedSize,
      height: currentSize.verifiedSize,
      borderRadius: "var(--radius-full)",
      background: "var(--primary-500)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "2px solid white",
      boxShadow: "var(--shadow-sm)",
    };

    return (
      <div ref={ref} style={containerStyles} {...props}>
        {src ? (
          <img src={src} alt={alt} style={imageStyles} />
        ) : name ? (
          getInitials(name)
        ) : (
          "?"
        )}
        {status && <span style={statusStyles} />}
        {verified && (
          <span style={verifiedStyles}>
            <svg
              width="60%"
              height="60%"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";
