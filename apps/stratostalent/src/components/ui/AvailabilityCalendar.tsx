"use client";

import { HTMLAttributes, forwardRef, useState } from "react";

interface AvailabilityCalendarProps extends HTMLAttributes<HTMLDivElement> {
  availability: {
    hourly?: number;
    daily?: number;
    monthly?: number;
    hoursPerWeek?: number;
  };
  timezone?: string;
  availableFrom?: string;
  bookedUntil?: string;
  compact?: boolean;
}

export const AvailabilityCalendar = forwardRef<
  HTMLDivElement,
  AvailabilityCalendarProps
>(
  (
    {
      availability,
      timezone = "CET",
      availableFrom,
      bookedUntil,
      compact = false,
      style,
      ...props
    },
    ref,
  ) => {
    const [selectedView, setSelectedView] = useState<
      "hourly" | "daily" | "monthly"
    >("hourly");

    const containerStyles: React.CSSProperties = {
      borderRadius: "var(--radius-xl)",
      overflow: "hidden",
      ...style,
    };

    const headerStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: compact ? "0.75rem 1rem" : "1rem 1.5rem",
      background: "var(--gradient-primary)",
      color: "#ffffff",
    };

    const titleStyles: React.CSSProperties = {
      fontSize: compact ? "0.875rem" : "1rem",
      fontWeight: 600,
    };

    const tabsStyles: React.CSSProperties = {
      display: "flex",
      gap: "0.25rem",
      background: "rgba(255,255,255,0.15)",
      padding: "0.25rem",
      borderRadius: "var(--radius-lg)",
    };

    const tabStyles = (active: boolean): React.CSSProperties => ({
      padding: "0.375rem 0.75rem",
      fontSize: "0.75rem",
      fontWeight: 500,
      borderRadius: "var(--radius-md)",
      background: active ? "rgba(255,255,255,0.25)" : "transparent",
      border: "none",
      color: "#ffffff",
      cursor: "pointer",
      transition: "all var(--transition-fast)",
    });

    const bodyStyles: React.CSSProperties = {
      padding: compact ? "1rem" : "1.5rem",
      background: "#ffffff",
    };

    const priceContainerStyles: React.CSSProperties = {
      textAlign: "center",
      marginBottom: compact ? "1rem" : "1.5rem",
    };

    const priceStyles: React.CSSProperties = {
      fontSize: compact ? "2rem" : "2.5rem",
      fontWeight: 800,
      background: "var(--gradient-primary)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    };

    const periodStyles: React.CSSProperties = {
      fontSize: "0.875rem",
      color: "var(--gray-500)",
    };

    const statusContainerStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      padding: "0.75rem",
      background: bookedUntil
        ? "rgba(245, 158, 11, 0.1)"
        : "rgba(16, 185, 129, 0.1)",
      borderRadius: "var(--radius-lg)",
      marginBottom: "1rem",
    };

    const statusDotStyles: React.CSSProperties = {
      width: "0.5rem",
      height: "0.5rem",
      borderRadius: "var(--radius-full)",
      background: bookedUntil ? "var(--warning)" : "var(--accent-500)",
      animation: "pulse-glow 2s ease-in-out infinite",
    };

    const statusTextStyles: React.CSSProperties = {
      fontSize: "0.8125rem",
      fontWeight: 500,
      color: bookedUntil ? "#d97706" : "var(--accent-600)",
    };

    const infoGridStyles: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "0.75rem",
    };

    const infoItemStyles: React.CSSProperties = {
      padding: "0.75rem",
      background: "var(--gray-50)",
      borderRadius: "var(--radius-md)",
      textAlign: "center",
    };

    const infoLabelStyles: React.CSSProperties = {
      fontSize: "0.6875rem",
      fontWeight: 500,
      color: "var(--gray-500)",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginBottom: "0.25rem",
    };

    const infoValueStyles: React.CSSProperties = {
      fontSize: "0.875rem",
      fontWeight: 600,
      color: "var(--gray-800)",
    };

    const getPrice = () => {
      switch (selectedView) {
        case "hourly":
          return availability.hourly ? `€${availability.hourly}` : "N/A";
        case "daily":
          return availability.daily ? `€${availability.daily}` : "N/A";
        case "monthly":
          return availability.monthly
            ? `€${availability.monthly.toLocaleString()}`
            : "N/A";
      }
    };

    const getPeriod = () => {
      switch (selectedView) {
        case "hourly":
          return "per hour";
        case "daily":
          return "per day";
        case "monthly":
          return "per month";
      }
    };

    return (
      <div ref={ref} style={containerStyles} {...props}>
        <div style={headerStyles}>
          <span style={titleStyles}>Availability & Rates</span>
          <div style={tabsStyles}>
            <button
              style={tabStyles(selectedView === "hourly")}
              onClick={() => setSelectedView("hourly")}
            >
              Hour
            </button>
            <button
              style={tabStyles(selectedView === "daily")}
              onClick={() => setSelectedView("daily")}
            >
              Day
            </button>
            <button
              style={tabStyles(selectedView === "monthly")}
              onClick={() => setSelectedView("monthly")}
            >
              Month
            </button>
          </div>
        </div>
        <div style={bodyStyles}>
          <div style={priceContainerStyles}>
            <div style={priceStyles}>{getPrice()}</div>
            <div style={periodStyles}>{getPeriod()}</div>
          </div>

          <div style={statusContainerStyles}>
            <span style={statusDotStyles} />
            <span style={statusTextStyles}>
              {bookedUntil
                ? `Booked until ${bookedUntil}`
                : availableFrom
                  ? `Available from ${availableFrom}`
                  : "Available Now"}
            </span>
          </div>

          <div style={infoGridStyles}>
            <div style={infoItemStyles}>
              <div style={infoLabelStyles}>Hours/Week</div>
              <div style={infoValueStyles}>
                {availability.hoursPerWeek || 40}h
              </div>
            </div>
            <div style={infoItemStyles}>
              <div style={infoLabelStyles}>Timezone</div>
              <div style={infoValueStyles}>{timezone}</div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

AvailabilityCalendar.displayName = "AvailabilityCalendar";
